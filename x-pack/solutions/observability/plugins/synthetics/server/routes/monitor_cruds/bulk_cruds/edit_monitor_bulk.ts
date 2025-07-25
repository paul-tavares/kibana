/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import { SavedObject, SavedObjectsUpdateResponse } from '@kbn/core/server';
import { SavedObjectError } from '@kbn/core-saved-objects-common';
import { RouteContext } from '../../types';
import { FailedPolicyUpdate } from '../../../synthetics_service/private_location/synthetics_private_location';
import {
  ConfigKey,
  EncryptedSyntheticsMonitorAttributes,
  HeartbeatConfig,
  MonitorFields,
  SyntheticsMonitor,
  SyntheticsMonitorWithSecretsAttributes,
  type SyntheticsPrivateLocations,
} from '../../../../common/runtime_types';
import {
  formatTelemetryUpdateEvent,
  sendTelemetryEvents,
} from '../../telemetry/monitor_upgrade_sender';

// Simplify return promise type and type it with runtime_types

export interface MonitorConfigUpdate {
  normalizedMonitor: SyntheticsMonitor;
  monitorWithRevision: SyntheticsMonitorWithSecretsAttributes;
  decryptedPreviousMonitor: SavedObject<SyntheticsMonitorWithSecretsAttributes>;
}

async function syncUpdatedMonitors({
  spaceId,
  privateLocations,
  routeContext,
  monitorsToUpdate,
}: {
  privateLocations: SyntheticsPrivateLocations;
  spaceId: string;
  routeContext: RouteContext;
  monitorsToUpdate: MonitorConfigUpdate[];
}) {
  const { syntheticsMonitorClient } = routeContext;

  return await syntheticsMonitorClient.editMonitors(
    monitorsToUpdate.map(({ normalizedMonitor, decryptedPreviousMonitor }) => ({
      monitor: {
        ...(normalizedMonitor as MonitorFields),
        [ConfigKey.CONFIG_ID]: decryptedPreviousMonitor.id,
        [ConfigKey.MONITOR_QUERY_ID]:
          normalizedMonitor[ConfigKey.CUSTOM_HEARTBEAT_ID] || decryptedPreviousMonitor.id,
      },
      id: decryptedPreviousMonitor.id,
      decryptedPreviousMonitor,
    })),
    privateLocations,
    spaceId
  );
}

export const syncEditedMonitorBulk = async ({
  routeContext,
  spaceId,
  monitorsToUpdate,
  privateLocations,
}: {
  monitorsToUpdate: MonitorConfigUpdate[];
  routeContext: RouteContext;
  privateLocations: SyntheticsPrivateLocations;
  spaceId: string;
}) => {
  const { server, monitorConfigRepository } = routeContext;

  try {
    const data = monitorsToUpdate.map(({ monitorWithRevision, decryptedPreviousMonitor }) => ({
      id: decryptedPreviousMonitor.id,
      attributes: {
        ...monitorWithRevision,
        [ConfigKey.CONFIG_ID]: decryptedPreviousMonitor.id,
        [ConfigKey.MONITOR_QUERY_ID]:
          monitorWithRevision[ConfigKey.CUSTOM_HEARTBEAT_ID] || decryptedPreviousMonitor.id,
      } as unknown as MonitorFields,
      previousMonitor: decryptedPreviousMonitor,
    }));
    const [editedMonitorSavedObjects, editSyncResponse] = await Promise.all([
      monitorConfigRepository.bulkUpdate({
        monitors: data,
        namespace: spaceId !== routeContext.spaceId ? spaceId : undefined,
      }),
      syncUpdatedMonitors({ monitorsToUpdate, routeContext, spaceId, privateLocations }),
    ]);

    const { failedPolicyUpdates, publicSyncErrors } = editSyncResponse;

    monitorsToUpdate.forEach(({ normalizedMonitor, decryptedPreviousMonitor }) => {
      const editedMonitorSavedObject = editedMonitorSavedObjects?.saved_objects.find(
        (obj) => obj.id === decryptedPreviousMonitor.id
      );

      sendTelemetryEvents(
        server.logger,
        server.telemetry,
        formatTelemetryUpdateEvent(
          editedMonitorSavedObject as SavedObjectsUpdateResponse<EncryptedSyntheticsMonitorAttributes>,
          decryptedPreviousMonitor.updated_at,
          server.stackVersion,
          Boolean((normalizedMonitor as MonitorFields)[ConfigKey.SOURCE_INLINE]),
          publicSyncErrors
        )
      );
    });

    const failedConfigs = await rollbackFailedUpdates({
      monitorsToUpdate,
      routeContext,
      failedPolicyUpdates,
    });

    return {
      failedConfigs,
      errors: publicSyncErrors,
      editedMonitors: editedMonitorSavedObjects?.saved_objects,
    };
  } catch (e) {
    await rollbackCompletely({ routeContext, monitorsToUpdate });
    throw e;
  }
};

export const rollbackCompletely = async ({
  routeContext,
  monitorsToUpdate,
}: {
  monitorsToUpdate: MonitorConfigUpdate[];
  routeContext: RouteContext;
}) => {
  const { server, monitorConfigRepository } = routeContext;
  try {
    await monitorConfigRepository.bulkUpdate({
      monitors: monitorsToUpdate.map(({ decryptedPreviousMonitor }) => ({
        id: decryptedPreviousMonitor.id,
        attributes: decryptedPreviousMonitor.attributes as unknown as MonitorFields,
        previousMonitor: decryptedPreviousMonitor,
      })),
    });
  } catch (error) {
    server.logger.error(`Unable to rollback Synthetics monitors edit, Error: ${error.message}`, {
      error,
    });
  }
};

export const rollbackFailedUpdates = async ({
  routeContext,
  failedPolicyUpdates,
  monitorsToUpdate,
}: {
  monitorsToUpdate: Array<{
    decryptedPreviousMonitor: SavedObject<SyntheticsMonitorWithSecretsAttributes>;
  }>;
  routeContext: RouteContext;
  failedPolicyUpdates?: FailedPolicyUpdate[];
}) => {
  if (!failedPolicyUpdates || failedPolicyUpdates.length === 0) {
    return;
  }
  const { server, monitorConfigRepository } = routeContext;

  try {
    const failedConfigs: Record<
      string,
      { config: HeartbeatConfig; error?: Error | SavedObjectError }
    > = {};

    failedPolicyUpdates.forEach(({ config, error }) => {
      if (config && config[ConfigKey.CONFIG_ID]) {
        failedConfigs[config[ConfigKey.CONFIG_ID]] = {
          config,
          error,
        };
      }
    });

    const monitorsToRevert = monitorsToUpdate
      .filter(({ decryptedPreviousMonitor }) => {
        return failedConfigs[decryptedPreviousMonitor.id];
      })
      .map(({ decryptedPreviousMonitor }) => ({
        id: decryptedPreviousMonitor.id,
        attributes: decryptedPreviousMonitor.attributes as unknown as MonitorFields,
        previousMonitor: decryptedPreviousMonitor,
      }));

    if (monitorsToRevert.length > 0) {
      await monitorConfigRepository.bulkUpdate({ monitors: monitorsToRevert });
    }
    return failedConfigs;
  } catch (error) {
    server.logger.error(
      `Unable to rollback Synthetics monitor failed updates, Error: ${error.message}`,
      { error }
    );
  }
};
