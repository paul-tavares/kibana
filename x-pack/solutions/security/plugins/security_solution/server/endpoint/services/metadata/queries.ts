/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { buildEsQlAgentStatusCommand } from '@kbn/fleet-plugin/server/services/agents/build_status_runtime_field';
import { metadataIndexPattern } from '../../../../common/endpoint/constants';

export const getEsQLFetchListQuery = async (options: {
  endpointPolicyIds: string[];
}): Promise<{ query: string }> => {
  const andMatchEndpointPolicyIds = `AND (
            Endpoint.policy.applied.id IN (${options.endpointPolicyIds
              .map((id) => `"${id}"`)
              .join(', ')})
            OR ${options.endpointPolicyIds
              .map((id) => `Endpoint.policy.applied.id LIKE "${id}#*"`)
              .join(' OR ')}
        )`;

  const fleetAgentStatusCommand = await buildEsQlAgentStatusCommand('fleet_agent.');

  return {
    query: `

    SET unmapped_fields = "LOAD";
    FROM ${metadataIndexPattern}
    | WHERE agent.id != "00000000-0000-0000-0000-000000000000"
        AND agent.id != "11111111-1111-1111-1111-111111111111"
        AND agent.id IS NOT NULL
    | INLINE STATS _max_ts = MAX(@timestamp) BY agent.id
    | WHERE @timestamp == _max_ts
        ${andMatchEndpointPolicyIds}
    | INLINE STATS total_count = COUNT(*)
    | ENRICH endpoint_metadata_fleet_agent_enrich_policy
        ON agent.id
        WITH fleet_agent.active = active,
            fleet_agent.policy_id = policy_id,
            fleet_agent.last_checkin_status = last_checkin_status,
            fleet_agent.last_checkin = last_checkin,
            fleet_agent.enrolled_at = enrolled_at,
            fleet_agent.audit_unenrolled_reason = audit_unenrolled_reason,
            fleet_agent.policy_revision_idx = policy_revision_idx,
            fleet_agent.upgrade_started_at = upgrade_started_at,
            fleet_agent.upgraded_at = upgraded_at,
            fleet_agent.unenrollment_started_at = unenrollment_started_at
    | WHERE fleet_agent.active == true
    /* Due to how some field mappings are defined, we need this special logic here */
    | EVAL host.os.name = host.os.name.text
    | EVAL host.os.full = host.os.host.full.text
    /* Calculate the Agent Status */
    ${fleetAgentStatusCommand}
    | KEEP \`@timestamp\`,
        status,
        elastic.*,
        agent.*,
        host.*,
        Endpoint.*,
        Endpoint.policy.applied.endpoint_policy_version, /* Unclear why this si not include in the star match above */
        Endpoint.policy.applied.version,
        event.*,
        data_stream.*,
        fleet_agent.active,
        fleet_agent.last_checkin_status,
        fleet_agent.last_checkin,
        fleet_agent.enrolled_at,
        total_count
    | SORT fleet_agent.enrolled_at ASC
    | LIMIT 10
`,
  };
};
