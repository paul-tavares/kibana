/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { estypes } from '@elastic/elasticsearch';
import type { SavedObjectsClientContract } from '@kbn/core/server';
import type { Logger } from '@kbn/core/server';

import { DEFAULT_MAX_AGENT_POLICIES_WITH_INACTIVITY_TIMEOUT } from '../../../common/constants';

import { AGENT_POLLING_THRESHOLD_MS } from '../../constants';
import { agentPolicyService } from '../agent_policy';
import { appContextService } from '../app_context';

const escapePainlessString = (s: string) => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

const MISSED_INTERVALS_BEFORE_OFFLINE = 12;
const MS_BEFORE_OFFLINE = MISSED_INTERVALS_BEFORE_OFFLINE * AGENT_POLLING_THRESHOLD_MS;
export type InactivityTimeouts = Awaited<
  ReturnType<(typeof agentPolicyService)['getInactivityTimeouts']>
>;

type StatusRuntimeMapping = NonNullable<estypes.MappingRuntimeFields> & {
  status: {
    type: 'keyword';
    script: {
      lang: 'painless';
      source: string;
    };
  };
};

let inactivityTimeoutsDisabled = false;
const _buildInactiveCondition = (opts: {
  now: number;
  inactivityTimeouts: InactivityTimeouts;
  maxAgentPoliciesWithInactivityTimeout: number;
  field: (path: string) => string;
  fieldPath: (path: string) => string;
  logger?: Logger;
}): string | null => {
  const {
    now,
    inactivityTimeouts,
    maxAgentPoliciesWithInactivityTimeout,
    field,
    fieldPath,
    logger,
  } = opts;
  // if there are no policies with inactivity timeouts, then no agents are inactive
  if (inactivityTimeouts.length === 0) {
    return null;
  }

  const totalAgentPoliciesWithInactivityTimeouts = inactivityTimeouts.reduce(
    (total, { policyIds }) => total + policyIds.length,
    0
  );

  // if too many agent policies have inactivity timeouts, then we can't use the inactivity timeout
  // as the query becomes too large see github.com/elastic/kibana/issues/150577
  if (totalAgentPoliciesWithInactivityTimeouts > maxAgentPoliciesWithInactivityTimeout) {
    if (!inactivityTimeoutsDisabled) {
      // only log this once as this function is executed a lot
      logger?.warn(
        `There are ${totalAgentPoliciesWithInactivityTimeouts} agent policies with an inactivity timeout set but the maximum allowed is ${maxAgentPoliciesWithInactivityTimeout}. Agents will not be marked as inactive.`
      );
      inactivityTimeoutsDisabled = true;
    }
    return null;
  }

  if (inactivityTimeoutsDisabled) {
    logger?.info(
      `There are ${totalAgentPoliciesWithInactivityTimeouts} agent policies which is now below the maximum allowed of ${maxAgentPoliciesWithInactivityTimeout}. Agents will now be marked as inactive again.`
    );
    inactivityTimeoutsDisabled = false;
  }

  const policyClauses = inactivityTimeouts
    .map(({ inactivityTimeout, policyIds }) => {
      const inactivityTimeoutMs = inactivityTimeout * 1000;
      const policyIdMatches = `[${policyIds
        .map((id) => `'${escapePainlessString(id)}'`)
        .join(',')}].contains(${field('policy_id')}.value)`;

      return `${policyIdMatches} && lastCheckinMillis < ${now - inactivityTimeoutMs}L`;
    })
    .join(' || ');

  return `lastCheckinMillis > 0 && doc.containsKey(${fieldPath('policy_id')}) && ${field(
    'policy_id'
  )}.size() > 0 && (${policyClauses})`;
};

function _buildSource(
  inactivityTimeouts: InactivityTimeouts,
  maxAgentPoliciesWithInactivityTimeout: number,
  pathPrefix?: string,
  logger?: Logger
) {
  const normalizedPrefix = pathPrefix ? `${pathPrefix}${pathPrefix.endsWith('.') ? '' : '.'}` : '';
  const field = (path: string) => `doc['${normalizedPrefix + path}']`;
  const fieldPath = (path: string) => `'${normalizedPrefix + path}'`;
  const now = Date.now();
  const agentIsInactiveCondition = _buildInactiveCondition({
    now,
    inactivityTimeouts,
    maxAgentPoliciesWithInactivityTimeout,
    field,
    fieldPath,
    logger,
  });

  return `
    long lastCheckinMillis = doc.containsKey(${fieldPath('last_checkin')}) && ${field(
    'last_checkin'
  )}.size() > 0
      ? ${field('last_checkin')}.value.toInstant().toEpochMilli()
      : (
          ${field('enrolled_at')}.size() > 0
          ? ${field('enrolled_at')}.value.toInstant().toEpochMilli()
          : -1
        );
    if (!doc.containsKey(${fieldPath('active')}) || (${field('active')}.size() > 0 && ${field(
    'active'
  )}.value == false)) {
      emit('unenrolled');
    }
    ${agentIsInactiveCondition ? `else if (${agentIsInactiveCondition}) {emit('inactive');}` : ''}
    else if (doc.containsKey('audit_unenrolled_reason') && ${field(
      'audit_unenrolled_reason'
    )}.size() > 0 && ${field('audit_unenrolled_reason')}.value == 'uninstall'){emit('uninstalled');}
    else if (doc.containsKey('audit_unenrolled_reason') && ${field(
      'audit_unenrolled_reason'
    )}.size() > 0 && ${field('audit_unenrolled_reason')}.value == 'orphaned'){emit('orphaned');}
    else if (
        lastCheckinMillis > 0
        && lastCheckinMillis
        < ${now - MS_BEFORE_OFFLINE}L
    ) {
      emit('offline');
    } else if (
      ${field('last_checkin_status')}.size() > 0 &&
      ${field('last_checkin_status')}.value.toLowerCase() == 'disconnected'
    ) {
      emit('offline');
    } else if (
      ${field('policy_revision_idx')}.size() == 0 || (
        ${field('upgrade_started_at')}.size() > 0 &&
        ${field('upgraded_at')}.size() == 0
      )
    ) {
      emit('updating');
    } else if (${field('last_checkin')}.size() == 0) {
      emit('enrolling');
    } else if (${field('unenrollment_started_at')}.size() > 0) {
      emit('unenrolling');
    } else if (
      ${field('last_checkin_status')}.size() > 0 &&
      ${field('last_checkin_status')}.value.toLowerCase() == 'error'
    ) {
        emit('error');
    } else if (
      ${field('last_checkin_status')}.size() > 0 &&
      ${field('last_checkin_status')}.value.toLowerCase() == 'degraded'
    ) {
      emit('degraded');
    } else {
      emit('online');
    }`.replace(/\s{2,}/g, ' '); // replace newlines and double spaces to save characters
}

// exported for testing
export function _buildStatusRuntimeField(opts: {
  inactivityTimeouts: InactivityTimeouts;
  maxAgentPoliciesWithInactivityTimeout?: number;
  pathPrefix?: string;
  logger?: Logger;
}): StatusRuntimeMapping {
  const {
    inactivityTimeouts,
    maxAgentPoliciesWithInactivityTimeout = DEFAULT_MAX_AGENT_POLICIES_WITH_INACTIVITY_TIMEOUT,
    pathPrefix,
    logger,
  } = opts;
  const source = _buildSource(
    inactivityTimeouts,
    maxAgentPoliciesWithInactivityTimeout,
    pathPrefix,
    logger
  );
  return {
    status: {
      type: 'keyword',
      script: {
        lang: 'painless',
        source,
      },
    },
  };
}

// Build the runtime field to return the agent status
// pathPrefix is used to prefix the field path in the source
// pathPrefix is used by the endpoint team currently to run
// agent queries against the endpoint metadata index
export async function buildAgentStatusRuntimeField(
  soClient?: SavedObjectsClientContract, // Deprecated, it's now using an internal client
  pathPrefix?: string
) {
  const config = appContextService.getConfig();

  let logger: Logger | undefined;
  try {
    logger = appContextService.getLogger();
  } catch (e) {
    // ignore, logger is optional
    // this code can be used and tested without an app context
  }
  const maxAgentPoliciesWithInactivityTimeout =
    config?.developer?.maxAgentPoliciesWithInactivityTimeout;
  const inactivityTimeouts = await agentPolicyService.getInactivityTimeouts();

  return _buildStatusRuntimeField({
    inactivityTimeouts,
    maxAgentPoliciesWithInactivityTimeout,
    pathPrefix,
    logger,
  });
}

export const buildEsQlAgentStatusCommand = async (
  fieldPathPrefix: string = ''
): Promise<string> => {
  // FIXME:PT needs to be validated for accuracy

  const config = appContextService.getConfig();

  let logger: Logger | undefined;
  try {
    logger = appContextService.getLogger().get('buildEsQlAgentStatusCommand');
  } catch (e) {
    // ignore, logger is optional
    // this code can be used and tested without an app context
  }

  const maxAgentPoliciesWithInactivityTimeout =
    config?.developer?.maxAgentPoliciesWithInactivityTimeout ||
    DEFAULT_MAX_AGENT_POLICIES_WITH_INACTIVITY_TIMEOUT;
  const inactivityTimeouts = await agentPolicyService.getInactivityTimeouts();
  const normalizedPrefix = fieldPathPrefix
    ? `${fieldPathPrefix}${fieldPathPrefix.endsWith('.') ? '' : '.'}`
    : '';
  const fieldPath = (path: string) => `${normalizedPrefix + path}`;
  const now = Date.now();
  let inactivityCondition = '';

  if (inactivityTimeouts.length > 0) {
    const totalAgentPoliciesWithInactivityTimeouts = inactivityTimeouts.reduce(
      (total, { policyIds }) => total + policyIds.length,
      0
    );

    // if too many agent policies have inactivity timeouts, then we can't use the inactivity timeout
    // as the query becomes too large see github.com/elastic/kibana/issues/150577
    if (totalAgentPoliciesWithInactivityTimeouts > maxAgentPoliciesWithInactivityTimeout) {
      if (!inactivityTimeoutsDisabled) {
        // only log this once as this function is executed a lot
        logger?.warn(
          `There are ${totalAgentPoliciesWithInactivityTimeouts} agent policies with an inactivity timeout set but the maximum allowed is ${maxAgentPoliciesWithInactivityTimeout}. Agents will not be marked as inactive.`
        );
        inactivityTimeoutsDisabled = true;
      }
      return '';
    }

    if (inactivityTimeoutsDisabled) {
      logger?.info(
        `There are ${totalAgentPoliciesWithInactivityTimeouts} agent policies which is now below the maximum allowed of ${maxAgentPoliciesWithInactivityTimeout}. Agents will now be marked as inactive again.`
      );
      inactivityTimeoutsDisabled = false;
    }

    inactivityCondition = `${fieldPath('last_checkin_millis')} > 0
        AND (
            ${inactivityTimeouts
              .map(({ policyIds, inactivityTimeout }) => {
                return `(${fieldPath('policy_id')} IN (${policyIds
                  .map((id) => `"${id}"`)
                  .join(',')})\n AND ${fieldPath('last_checkin_millis')} < ${
                  now - inactivityTimeout * 1000
                })`;
              })
              .join('\n OR ')}
            )`;
  }

  return `| EVAL ${fieldPath('last_checkin_millis')} = COALESCE(TO_LONG(${fieldPath(
    'last_checkin'
  )}), TO_LONG(${fieldPath('enrolled_at')}))
    | EVAL status = CASE(
        ${fieldPath('active')} IS NULL OR ${fieldPath('active')} == false,
        "unenrolled",
        ${inactivityCondition ? `${inactivityCondition},\n"inactive",` : ''}
        ${fieldPath('audit_unenrolled_reason')} == "uninstall",
        "uninstalled",
        ${fieldPath('audit_unenrolled_reason')} == "orphaned",
        "orphaned",
        ${fieldPath('last_checkin_millis')} > 0 AND ${fieldPath('last_checkin_millis')} < ${
    now - MS_BEFORE_OFFLINE
  },
        "offline",
        TO_LOWER(${fieldPath('last_checkin_status')}) == "disconnected",
        "offline",
        ${fieldPath('policy_revision_idx')} IS NULL
        OR (${fieldPath('upgrade_started_at')} IS NOT NULL AND ${fieldPath('upgraded_at')} IS NULL),
        "updating",
        ${fieldPath('last_checkin')} IS NULL,
        "enrolling",
        ${fieldPath('unenrollment_started_at')} IS NOT NULL,
        "unenrolling",
        TO_LOWER(${fieldPath('last_checkin_status')}) == "error",
        "error",
        TO_LOWER(${fieldPath('last_checkin_status')}) == "degraded",
        "degraded",
        "online"
    )`;
};
