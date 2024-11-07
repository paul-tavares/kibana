/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useIsMounted } from '@kbn/securitysolution-hook-utils';
import { EuiButtonEmpty, EuiIcon, EuiLoadingChart, EuiText } from '@elastic/eui';
import { cloneDeep, get } from 'lodash';
import { set } from '@kbn/safer-lodash-set';
import styled from 'styled-components';
import { useFetchDirectoryContent } from '../hooks/use_fetch_directory_content';
import { useGetActionDetails } from '../../../../hooks/response_actions/use_get_action_details';
import { createFilesystemItem, isFilesystemItem, useFileBrowserState } from './state';
import { useSendExecuteEndpoint } from '../../../../hooks/response_actions/use_send_execute_endpoint_request';
import { POC_HOST_SCRIPT_PATH } from '../constants';
import type { FilesystemItem } from '../types';

const DirectoryContainer = styled.div`
  .dir-children {
    margin-left: 1em;
  }
`;

export interface DirectoryProps {
  item: FilesystemItem;
}

export const Directory = memo<DirectoryProps>(({ item }) => {
  const isMounted = useIsMounted();
  const [isOpen, setIsOpen] = useState(
    // Root directory is always initially opened, so that we can retrieve the initial content
    item.fullPath === '/'
  );
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
  const dirStoreKeyPath: string[] = useMemo(() => {
    return getStoreKeyPathForFilePath(item.fullPath);
  }, [item.fullPath]);
  const dirChildren = useMemo(() => {
    return Object.values(item.contents ?? {}).filter((dirItem) => dirItem.type === 'directory');
  }, [item.contents]);

  const handleDirOnClick = useCallback(() => {
    setIsOpen((prevState) => !prevState);
    setState((prevState) => {
      return {
        ...prevState,
        showDetailsFor: item,
      };
    });
  }, [item, setState]);

  // When directory content is received, process it and add content to the store
  useEffect(() => {
    if (
      item.action &&
      directoryContent.data &&
      (!item.loaded || item.loadedFromActionId !== item.action.actionId)
    ) {
      setState((prevState) => {
        const newState = {
          ...prevState,
          filesystem: cloneDeep(prevState.filesystem),
        };

        for (const dirItem of directoryContent.data.data.contents) {
          const pathTokens = getStoreKeyPathForFilePath(dirItem.full_path);
          set(
            newState,
            pathTokens,
            createFilesystemItem({
              fullPath: dirItem.full_path,
              type: dirItem.type,
              loadedFromActionId: directoryContent.data.data.actionId,
              meta: {
                modified: dirItem.modified,
                name: dirItem.name,
                size: dirItem.size,
              },
              action: {
                ...item.action,
              },
            })
          );

          // Walk this path and if for any Directory item, if that directory item has children (contents), then
          // set it as loaded
          let filesystemItem: FilesystemItem = newState.filesystem;
          for (const pathToken of pathTokens) {
            if (pathToken !== 'filesystem') {
              filesystemItem = filesystemItem[pathToken];
            }

            if (isFilesystemItem(filesystemItem)) {
              if (filesystemItem.type === 'file') {
                filesystemItem.loaded = true;
              } else {
                if (filesystemItem.contents) {
                  filesystemItem.loaded = true;
                  filesystemItem.action = { ...item.action };
                  filesystemItem.loadedFromActionId = directoryContent.data.data.actionId;
                } else {
                  filesystemItem.loaded = false;
                  filesystemItem.action = undefined;
                  filesystemItem.loadedFromActionId = '';
                }
              }
            }
          }
        }

        // If there is a directory whose content is currently being displayed, ensure it is
        // still valid based on this latest update to the filesystem
        if (newState.showDetailsFor) {
          newState.showDetailsFor = get(
            newState,
            getStoreKeyPathForFilePath(newState.showDetailsFor.fullPath)
          );
        }

        // ensure that the folder that triggered the retrieval of content is marked as loaded - this
        // takes care of directories that may not have any content since the process above will set
        // them to now show as loaded
        set(newState, dirStoreKeyPath.concat('loaded'), true);
        set(
          newState,
          dirStoreKeyPath.concat('loadedFromActionId'),
          directoryContent.data.data.actionId
        );
        set(newState, dirStoreKeyPath.concat('action'), { ...item.action });

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

  // Send the `execute` action to get the content for the directory
  useEffect(() => {
    if (!item.loaded && !item.action && isOpen) {
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
              set(newState, dirStoreKeyPath.concat('action'), {
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
        set(newState, dirStoreKeyPath.concat('action'), {
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
    isOpen,
    item.action,
    item.fullPath,
    item.loaded,
    setState,
    state.agentId,
    state.agentType,
  ]);

  // When the Execute action completes, update the store with its info.
  useEffect(() => {
    if (actionDetails.data?.data.isCompleted && item.action?.isPending) {
      setState((prevState) => {
        const newState = cloneObjectPath(prevState, dirStoreKeyPath);
        set(newState, dirStoreKeyPath.concat('action', 'isPending'), false);
        set(
          newState,
          dirStoreKeyPath.concat('action', 'retrieved'),
          actionDetails.data.data.completedAt
        );
        return newState;
      });
    }
  }, [
    actionDetails.data?.data.completedAt,
    actionDetails.data?.data.isCompleted,
    dirStoreKeyPath,
    item.action?.isPending,
    item.fullPath,
    setState,
  ]);

  return (
    <DirectoryContainer>
      <EuiButtonEmpty onClick={handleDirOnClick}>
        <EuiText>
          <EuiIcon type={isOpen ? 'folderOpen' : item.loaded ? 'folderCheck' : 'folderClosed'} />
          &nbsp;
          {item.meta?.name || item.fullPath}&nbsp;
          {!item.loaded && item.action?.isPending && <EuiLoadingChart size="m" mono />}
          <div />
        </EuiText>
      </EuiButtonEmpty>

      {isOpen && dirChildren.length > 0 ? (
        <EuiText className={'dir-children'}>
          {dirChildren.map((childItem) => {
            return <Directory item={childItem} key={childItem.fullPath} />;
          })}
        </EuiText>
      ) : null}
    </DirectoryContainer>
  );
});
Directory.displayName = 'Directory';

// -------------------------------------------
// Module Private utilities
// -------------------------------------------

const cloneObjectPath = <T extends object>(obj: T, path: string[]): T => {
  const paths = path;
  const mutatePath: string[] = [];
  const newObj = { ...obj };

  for (const pathValue of paths) {
    mutatePath.push(pathValue);
    set(newObj, mutatePath, { ...get(newObj, mutatePath) });
  }

  return newObj;
};

const getStoreKeyPathForFilePath = (filePath: string): string[] => {
  const dirPathTokens = filePath === '/' ? ['filesystem'] : `filesystem${filePath}`.split('/');
  const pathTokens: string[] = [];

  if (filePath === '/') {
    pathTokens.push('filesystem');
  } else {
    dirPathTokens.forEach((pathToken, index) => {
      if (index === 0) {
        pathTokens.push(pathToken);
      } else {
        pathTokens.push('contents', pathToken);
      }
    });
  }

  return pathTokens;
};
