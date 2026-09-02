/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { Logger } from '@kbn/logging';
import { buildPolicyBaseIdsWithFallbackKuery } from '@kbn/fleet-plugin/common/services';
import { keyBy } from 'lodash';
import { mapEsQlResultTopObjects } from './utils';
import { getEsQlFetchLatestLatestEndpointMetadataByAgentIds } from './queries';
import type { HostMetadataInterface } from '../../../../../common/endpoint/types';
import { stringify } from '../../../utils/stringify';
import { catchAndWrapError } from '../../../utils';
import type { EndpointAppContextService } from '../../../endpoint_app_context_services';
import { UNIFIED_METADATA_INDEX_NAME, INDEX_TEMPLATE } from './es_index_template';

interface UnifiedMetadataManagerOptions {
  endpointContextServices: EndpointAppContextService;
  // TODO:PT should we support a "asOf" date parameter?
  //  Task could keep state based on end of last run and then could feed that to this class which
  //  would possibly make runs faster by not having to loop through all agents.
}

/**
 * Unified Metadata Manager merges data from Fleet agents with latest endpoint metadata and
 * saves it to the unified metadata index.
 */
export class UnifiedMetadataManager {
  private abortController = new AbortController();
  private batchSize = 1000;
  protected readonly endpointContextServices: EndpointAppContextService;
  protected readonly logger: Logger;

  constructor(options: UnifiedMetadataManagerOptions) {
    this.endpointContextServices = options.endpointContextServices;
    this.logger = this.endpointContextServices.createLogger('UnifiedMetadataManager');
    this.abortController.abort('init');
  }

  private async ensureIndexCreated(): Promise<void> {
    this.logger.debug(`checking to ensure index [${UNIFIED_METADATA_INDEX_NAME}] exists`);

    const esClient = this.endpointContextServices.getInternalEsClient();
    const indexExists = await esClient.indices
      .exists({ index: UNIFIED_METADATA_INDEX_NAME })
      .catch(catchAndWrapError);

    if (indexExists) {
      this.logger.debug(`index [${UNIFIED_METADATA_INDEX_NAME}] already exists`);
      return;
    }

    this.logger.debug(`creating index [${UNIFIED_METADATA_INDEX_NAME}]`);

    await esClient.indices
      .create({
        index: UNIFIED_METADATA_INDEX_NAME,
        settings: INDEX_TEMPLATE.settings,
        mappings: INDEX_TEMPLATE.mappings,
      })
      .catch(catchAndWrapError);

    this.logger.debug(`index [${UNIFIED_METADATA_INDEX_NAME}] created successfuly`);
  }

  private wasAborted(): boolean {
    if (this.abortController.signal.aborted) {
      this.logger.debug('run was aborted - stoping execution.');
    }

    return this.abortController.signal.aborted;
  }

  /**
   * Fetches the latest metadata for the given endpoint ids.
   * @param agentIds
   * @private
   */
  private async fetchEndpointLatestMetadata(agentIds: string[]): Promise<HostMetadataInterface[]> {
    const logger = this.logger.get('fetchEndpointLatestMetadata');

    logger.debug(
      () => `fetching latest metadata for [${agentIds.length}] agent IDs: [${agentIds.join(', ')}]`
    );

    const esClient = this.endpointContextServices.getInternalEsClient();
    const query = getEsQlFetchLatestLatestEndpointMetadataByAgentIds(agentIds);

    logger.debug(`Executing elasticsearch query:\n${query}`);

    return esClient.esql
      .query({ query })
      .then((result) => {
        const results = mapEsQlResultTopObjects<HostMetadataInterface>(result);

        logger.debug(`Query returned [${results.length}] results`);

        return results;
      })
      .catch(catchAndWrapError);
  }

  public async run(): Promise<void> {
    if (!this.abortController.signal.aborted) {
      this.logger.debug('A run is already being executed! exiting');
      return;
    }

    this.logger.debug('Starting run to check unified metadata');

    // TODO:PT should check if Endpoint is even installed before proceeding

    try {
      this.abortController = new AbortController();
      await this.ensureIndexCreated();

      if (this.wasAborted()) {
        return;
      }

      const esClient = this.endpointContextServices.getInternalEsClient();
      const fleetServices = this.endpointContextServices.getInternalFleetServices(undefined, true);
      const agentPolicyIdsWithEndpoint: string[] = [];
      const packagePoliciesIterator = await fleetServices.packagePolicy.fetchAllItems(
        fleetServices.getSoClient(),
        {
          kuery: fleetServices.endpointPolicyKuery,
          fields: ['id', 'policy_ids'],
          perPage: this.batchSize,
        }
      );

      for await (const packagePolicyBatch of packagePoliciesIterator) {
        const batchAgentPolicyIds = packagePolicyBatch.flatMap((policy) => policy.policy_ids);
        agentPolicyIdsWithEndpoint.push(...batchAgentPolicyIds);
      }

      this.logger.debug(
        `A total of [${agentPolicyIdsWithEndpoint.length}] agent policies are running with endpoint integration`
      );

      if (this.wasAborted()) {
        return;
      }

      // Fleet Agents are our primary source, so we loop through them and ensure they are in the
      // unified index along with endpoint metadata

      // TODO:PT should we use `searchAfter` instead? Fleet api supports it

      let pitId: string = '';
      let page = 0;
      let hasMorePages = true;
      const kuery = buildPolicyBaseIdsWithFallbackKuery(
        agentPolicyIdsWithEndpoint,
        `${fleetServices.agentsFieldPrefix}.policy_base_id`,
        `${fleetServices.agentsFieldPrefix}.policy_id`
      );

      // TODO:PT need to think about if there is a better approach to see if we can process only agent data that has changed.

      const getAgentListOptions = (): Parameters<typeof fleetServices.fetchAgentList>[0] => {
        return {
          showInactive: true, // TODO:PT Should we pull these? the default is false.
          perPage: this.batchSize,
          page: ++page,
          kuery,
          ...(pitId ? { pitId } : { openPit: true, pitKeepAlive: '10m' }),
        };
      };

      while (hasMorePages) {
        const fleetAgentsRequestOptions = getAgentListOptions();
        this.logger.debug(
          () => `Fetching batch of fleet agents with:\n${stringify(fleetAgentsRequestOptions)}`
        );
        const agentBatch = await fleetServices.fetchAgentList(fleetAgentsRequestOptions);

        if (agentBatch.agents.length === 0) {
          hasMorePages = false;
          // eslint-disable-next-line no-continue
          continue;
        }

        if (!pitId && agentBatch.pit) {
          this.logger.debug(
            `Processing a total of [${agentBatch.total}] agents running with endpoint`
          );
          pitId = agentBatch.pit;
        }

        const fleetAgentsById = keyBy(agentBatch.agents, 'id');
        const latestEndpointMetadata = await this.fetchEndpointLatestMetadata(
          Object.keys(fleetAgentsById)
        );
        const latestEndpointMetadataById = keyBy(latestEndpointMetadata, 'agent.id');

        if (this.wasAborted()) {
          return;
        }

        for (const [agentId, fleetAgent] of Object.entries(fleetAgentsById)) {
          if (!latestEndpointMetadataById[agentId]) {
            this.logger.debug(
              () =>
                `no endpoint metadata found for agent ID [${agentId} | ${
                  fleetAgent.local_metadata?.host?.hostname ?? '?'
                }]`
            );
            // eslint-disable-next-line no-continue
            continue;
          }

          const unifiedEndpointRecord = {
            // FIXME:PT We don't actually need to store the entire agent record. We should only store only what we need
            agent: fleetAgent,
            endpoint: latestEndpointMetadataById[agentId],
          };

          this.logger.debug(`updating unified record for agent id [${fleetAgent.id}]`);

          // FIXME:PT use QueueProcessor to make update in bulk and NOT one at a time

          await esClient
            .index({
              index: UNIFIED_METADATA_INDEX_NAME,
              id: fleetAgent.id,
              document: unifiedEndpointRecord,
            })
            .catch(catchAndWrapError);

          if (this.wasAborted()) {
            return;
          }
        }

        // TODO:PT after we implement QueueProcessor, we need to wait for it to process all updates

        // TODO:PT implement metrics and output them when run completes
      }
    } catch (error) {
      this.logger.error(`Error running UnifiedMetadataManager: ${error.message}`, { error });
      await this.cancel();
      throw error;
    } finally {
      this.abortController.abort(`run completed at ${new Date().toISOString()}!`);
      this.logger.debug('Run completed');
    }
  }

  public async cancel(): Promise<void> {
    if (!this.abortController.signal.aborted) {
      this.abortController.abort(`run canceled at ${new Date().toISOString()}!`);

      // Sleep 2 seconds to give an opportunity for the abort signal to be processed
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
}
