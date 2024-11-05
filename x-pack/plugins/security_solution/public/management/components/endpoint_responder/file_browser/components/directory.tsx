/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { memo, useEffect } from 'react';
import { useIsMounted } from '@kbn/securitysolution-hook-utils';
import { EuiLoadingSpinner, EuiText } from '@elastic/eui';
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

  useEffect(() => {
    if (!state.filesystem.loaded && !state.filesystem.action) {
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
              return {
                ...prevState,
                filesystem: {
                  ...state.filesystem,
                  action: {
                    actionId: response.data.id,
                    isPending: true,
                    retrieved: '',
                  },
                },
              };
            });
          }
        });

      setState((prevState) => {
        return {
          ...prevState,
          filesystem: {
            ...prevState.filesystem,
            action: {
              actionId: '',
              isPending: true,
              retrieved: '',
            },
          },
        };
      });
    }
  }, [
    executeResponseAction,
    isMounted,
    item.fullPath,
    setState,
    state.agentId,
    state.agentType,
    state.filesystem,
    state.filesystem.action,
    state.filesystem.loaded,
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
