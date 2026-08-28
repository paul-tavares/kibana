/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type {
  RunContext,
  TaskManagerSetupContract,
  TaskManagerStartContract,
} from '@kbn/task-manager-plugin/server';
import type { Logger } from '@kbn/logging';
import { UnifiedMetadataManager } from './unified_metadata_manager';
import { calculateDateFromInterval } from '../../calculate_date_from_interval';
import { EndpointError } from '../../../../../common/endpoint/errors';
import type { EndpointAppContext } from '../../../types';

const TASK_VERSION = '1.0.0';
const TASK_TYPE = 'endpoint:unified-metadata-maintainer';
const TASK_ID = `${TASK_TYPE}:${TASK_VERSION}`;
const DEFAULT_TASK_TIMEOUT = '20m';
const DEFAULT_TASK_INTERVAL = '60s';

/**
 * Maintains the unified endpoint ++ fleet agent metadata index
 */
export class UnifiedMetadataTask {
  private logger: Logger = {} as unknown as Logger;
  private readonly taskTimeout: string;
  private readonly taskInterval: string;
  private isSetupDone: boolean = false;
  private isStartDone: boolean = false;

  constructor(private readonly endpointAppContext: EndpointAppContext) {
    // FIXME:PT these need to be retrieved from kibana server config settings
    this.taskTimeout = DEFAULT_TASK_TIMEOUT;
    this.taskInterval = DEFAULT_TASK_INTERVAL;
  }

  public setup(taskManager: TaskManagerSetupContract) {
    this.logger = this.endpointAppContext.service.createLogger(TASK_TYPE);

    this.logger.info(
      `Registering ${TASK_TYPE} task with timeout of [${DEFAULT_TASK_TIMEOUT}], interval of [${DEFAULT_TASK_INTERVAL}]`
    );

    taskManager.registerTaskDefinitions({
      [TASK_TYPE]: {
        title: 'Security Solution Endpoint unified host metadata manager',
        timeout: this.taskTimeout,
        createTaskRunner: ({ taskInstance }: RunContext) => {
          const unifiedMetadataManager = new UnifiedMetadataManager({
            endpointContextServices: this.endpointAppContext.service,
          });

          return {
            run: async () => {
              // Check that this task is current
              if (taskInstance.id !== TASK_ID) {
                // old task, return
                this.logger.warn(
                  `Outdated task running [${taskInstance.id}]. Exiting (nothing was done!)`
                );
                return;
              }

              this.logger.debug(`Started. Checking if endpoint unified metadata needs updates`);

              const startTime = new Date();

              try {
                await unifiedMetadataManager.run();
              } catch (err) {
                this.logger.error(`Task execution failed: ${err.message}`);
              }

              const endTime = new Date().getTime();
              const nextRun = calculateDateFromInterval(this.taskInterval, undefined, this.logger);

              this.logger.debug(
                () =>
                  `Complete. Task run took ${
                    endTime - startTime.getTime()
                  }ms [ stated: ${startTime.toISOString()} ]. Next run at: [${nextRun?.toISOString()}]`
              );

              return {
                state: {},
                runAt: nextRun,
              };
            },
            cancel: async () => {
              return unifiedMetadataManager.cancel();
            },
          };
        },
      },
    });

    this.isSetupDone = true;
    this.isStartDone = false;
  }

  public async start(taskManagerStartContract: TaskManagerStartContract) {
    try {
      await taskManagerStartContract.ensureScheduled({
        id: TASK_ID,
        taskType: TASK_TYPE,
        scope: ['securitySolution'],
        schedule: {
          interval: this.taskInterval,
        },
        state: {},
        params: { version: TASK_VERSION },
      });

      this.isStartDone = true;
    } catch (e) {
      this.logger.error(new EndpointError(`Error scheduling task, received ${e.message}`, e));
    }
  }

  public stop() {
    this.isSetupDone = false;
    this.isStartDone = false;
  }
}
