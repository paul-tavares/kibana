/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { Logger } from '@kbn/logging';
import type { EndpointAppContextService } from '../../../endpoint_app_context_services';

/**
 * Index name that will be used to store unified endpoint ++ agent metadata
 *
 * FIXME: need perhaps better index name. Just using this one because its a pattern already allowed by kibana_system user
 */
const UNIFIED_METADATA_INDEX_NAME = '.metrics-endpoint.metadata_united_default';

interface UnifiedMetadataManagerOptions {
  endpointContextServices: EndpointAppContextService;
}

/**
 * Unified Metadata Manager merges data from Fleet agents with latest endpoint metadata and
 * saves it to the unified metadata index.
 */
export class UnifiedMetadataManager {
  private abortController = new AbortController();
  protected readonly endpointContextServices: EndpointAppContextService;
  protected readonly logger: Logger;

  constructor(options: UnifiedMetadataManagerOptions) {
    this.endpointContextServices = options.endpointContextServices;
    this.logger = this.endpointContextServices.createLogger('UnifiedMetadataManager');
    this.abortController.abort('init');
  }

  public async run(): Promise<void> {
    if (!this.abortController.signal.aborted) {
      this.logger.debug('A run is already being executed! exiting');
      return;
    }

    this.logger.debug('Starting run to check unified metadata');

    try {
      this.abortController = new AbortController();

      // TODO:PT implement task here
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
