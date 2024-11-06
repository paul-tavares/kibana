/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { memo, useEffect, useMemo } from 'react';
import { useIsMounted } from '@kbn/securitysolution-hook-utils';
import { EuiLoadingSpinner, EuiText } from '@elastic/eui';
import { get } from 'lodash';
import { set } from '@kbn/safer-lodash-set';
import { useFetchDirectoryContent } from '../hooks/use_fetch_directory_content';
import { useGetActionDetails } from '../../../../hooks/response_actions/use_get_action_details';
import { useFileBrowserState } from './state';
import { useSendExecuteEndpoint } from '../../../../hooks/response_actions/use_send_execute_endpoint_request';
import { POC_HOST_SCRIPT_PATH } from '../constants';
import type { FilesystemItem } from '../types';

export interface DirectoryProps {
  item: FilesystemItem;
}

export const Directory = memo<DirectoryProps>(({ item }) => {
  const isMounted = useIsMounted();
  const [state, setState] = useFileBrowserState();
  const executeResponseAction = useSendExecuteEndpoint();
  const actionDetails = useGetActionDetails(item.action?.actionId ?? '', {
    enabled: Boolean(item.action && item.action.isPending && item.action?.actionId),
    refetchInterval: 5000, // 5s
  });
  const directoryContent = useFetchDirectoryContent(item.action?.actionId ?? '', {
    enabled: Boolean(
      item.action &&
        !item.action.isPending &&
        item.action?.actionId &&
        (!item.loaded || item.loadedFromActionId !== item.action.actionId)
    ),
  });

  const dirStoreKeyPath = useMemo(() => {
    return item.fullPath === '/' ? 'filesystem' : item.fullPath.replace(/\//, '.');
  }, [item.fullPath]);

  useEffect(() => {
    if (
      item.action &&
      directoryContent.data &&
      (!item.loaded || item.loadedFromActionId !== item.action.actionId)
    ) {
      // populate directory structure into state

      setState((prevState) => {
        const newState = cloneObjectPath(prevState, dirStoreKeyPath);
        set(newState, `${dirStoreKeyPath}.loaded`, true);
        set(newState, `${dirStoreKeyPath}.loadedFromActionId`, item.action.actionId); // FIXME:PT need to use actionID from response
        return newState;
      });
    }
  }, [
    dirStoreKeyPath,
    directoryContent.data,
    item.action,
    item.loaded,
    item.loadedFromActionId,
    setState,
  ]);

  useEffect(() => {
    if (!item.loaded && !item.action) {
      executeResponseAction
        .mutateAsync({
          agent_type: state.agentType,
          endpoint_ids: [state.agentId],
          parameters: {
            command: `${POC_HOST_SCRIPT_PATH} ${item.fullPath} 2>/dev/null`,
          },
        })
        .then((response) => {
          if (isMounted()) {
            setState((prevState) => {
              const newState = cloneObjectPath(prevState, dirStoreKeyPath);
              set(newState, `${dirStoreKeyPath}.action`, {
                actionId: response.data.id,
                isPending: true,
                retrieved: '',
              });

              return newState;
            });
          }
        });

      setState((prevState) => {
        const newState = cloneObjectPath(prevState, dirStoreKeyPath);
        set(newState, `${dirStoreKeyPath}.action`, {
          actionId: '',
          isPending: true,
          retrieved: '',
        });

        return newState;
      });
    }
  }, [
    dirStoreKeyPath,
    executeResponseAction,
    isMounted,
    item.action,
    item.fullPath,
    item.loaded,
    setState,
    state.agentId,
    state.agentType,
    state.filesystem,
    state.filesystem.action,
    state.filesystem.loaded,
  ]);

  useEffect(() => {
    if (actionDetails.data?.data.isCompleted && state.filesystem.action?.isPending) {
      setState((prevState) => {
        const newState = cloneObjectPath(prevState, dirStoreKeyPath);
        set(newState, `${dirStoreKeyPath}.action.isPending`, false);
        set(newState, `${dirStoreKeyPath}.action.retrieved`, actionDetails.data.data.completedAt);
        return newState;
      });
    }
  }, [
    actionDetails.data?.data.completedAt,
    actionDetails.data?.data.isCompleted,
    dirStoreKeyPath,
    item.fullPath,
    setState,
    state.filesystem.action?.isPending,
  ]);

  if (!state.filesystem.loaded) {
    return (
      <EuiText>
        <EuiLoadingSpinner />
        <span>{'Loading directory structure'}</span>
      </EuiText>
    );
  }

  return <div>{'Directory placeholder'}</div>;
});
Directory.displayName = 'Directory';

const cloneObjectPath = <T extends object>(obj: T, path: string): T => {
  const paths = path.split('.');
  let mutatePath = '';
  const newObj = { ...obj };

  for (const pathValue of paths) {
    mutatePath += (mutatePath.length > 0 ? '.' : '') + pathValue;
    set(newObj, mutatePath, { ...get(newObj, mutatePath) });
  }

  return newObj;
};
