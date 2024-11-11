/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { memo, useCallback, useMemo } from 'react';
import type { EuiBasicTableColumn } from '@elastic/eui';
import {
  EuiPanel,
  EuiButtonIcon,
  EuiSpacer,
  EuiIcon,
  EuiTitle,
  EuiBasicTable,
  EuiLoadingChart,
  EuiEmptyPrompt,
  EuiText,
  EuiLoadingLogo,
} from '@elastic/eui';
import { FormattedNumber } from '@kbn/i18n-react';
import { useAppToasts } from '../../../../../common/hooks/use_app_toasts';
import { useSendGetFileRequest } from '../../../../hooks/response_actions/use_send_get_file_request';
import { FormattedDate } from '../../../../../common/components/formatted_date';
import { getEmptyValue } from '../../../../../common/components/empty_value';
import type { FilesystemItem } from '../types';
import { useFileBrowserState } from './state';

export interface DirectoryContentProps {
  foo?: string;
}

export const DirectoryContent = memo<DirectoryContentProps>((props) => {
  const [state] = useFileBrowserState();
  const getFileAction = useSendGetFileRequest();
  const toast = useAppToasts();
  const dirChildren: FilesystemItem[] = useMemo(() => {
    return Object.values(state.showDetailsFor?.contents ?? {});
  }, [state.showDetailsFor]);
  const item = useMemo(() => {
    return state.showDetailsFor;
  }, [state.showDetailsFor]);

  const handleFileDownloadOnClick = useCallback(
    (fileItem: FilesystemItem) => {
      getFileAction
        .mutateAsync({
          endpoint_ids: [state.agentId],
          agent_type: state.agentType,
          parameters: {
            path: fileItem.fullPath,
          },
        })
        .then((response) => {
          toast.api.addInfo({
            title: 'Retrieving file',
            text: `A get-file action was sent to the host for file: ${fileItem.fullPath}`,
          });
          // /app/security/administration/response_actions_history?withOutputs=ab59cd2b-0e00-4f72-932a-a424d811d3c2
        });
    },
    [getFileAction, state.agentId, state.agentType, toast.api]
  );

  const tableColumns: Array<EuiBasicTableColumn<FilesystemItem>> = useMemo(() => {
    return [
      {
        field: 'type',
        name: '', // Icon
        render: (type) => {
          return <EuiIcon type={type === 'file' ? 'document' : 'folderClosed'} />;
        },
        width: '25px',
        align: 'center',
      },

      {
        field: 'meta.name',
        name: 'Name',
      },

      {
        field: 'meta.size',
        name: 'Size',
        render: (size, fileItem) => {
          if (fileItem.type === 'directory') {
            return getEmptyValue();
          }

          return <FormattedNumber value={size} style="unit" unit="byte" unitDisplay="short" />;
        },
      },

      {
        field: 'meta.modified',
        name: 'Modified',
        render: (modifiedDate) => {
          if (modifiedDate) {
            return (
              <FormattedDate
                fieldName={'Modified'}
                value={modifiedDate}
                className="eui-textTruncate"
              />
            );
          }

          return getEmptyValue();
        },
      },

      {
        name: 'Actions',
        actions: [
          {
            render: (fileItem) => {
              if (fileItem.type !== 'file') {
                return <>{getEmptyValue()}</>;
              }

              return (
                <EuiButtonIcon
                  iconType="download"
                  onClick={() => handleFileDownloadOnClick(fileItem)}
                  title={'Download file'}
                />
              );
            },
          },
        ],
      },
    ];
  }, [handleFileDownloadOnClick]);

  const directoryContent = useMemo(() => {
    if (!state.filesystem.loaded) {
      return (
        <EuiEmptyPrompt
          title={
            <div>
              <EuiLoadingLogo logo="logoSecurity" size="xl" />
            </div>
          }
          body={<EuiText>{'Loading directory structure for host'}</EuiText>}
        />
      );
    }

    if (!item) {
      return (
        <EuiEmptyPrompt
          title={<h3>{'Browse'}</h3>}
          body={<EuiText>{'Click on a directory to see its content'}</EuiText>}
        />
      );
    }

    if (dirChildren.length === 0) {
      if (item.action?.isPending) {
        return (
          <EuiEmptyPrompt
            title={<h3>{'Loading'}</h3>}
            body={<EuiText>{'Retrieving directory content'}</EuiText>}
          />
        );
      }

      return (
        <EuiEmptyPrompt
          title={<h3>{'Empty'}</h3>}
          body={<EuiText>{'Directory does not have any content'}</EuiText>}
        />
      );
    }

    return (
      <EuiBasicTable
        items={dirChildren}
        columns={tableColumns}
        onChange={() => {
          // TODO:PT implement sorting
        }}
        sorting={{
          sort: {
            field: 'type',
            direction: 'asc',
          },
          enableAllColumns: true,
        }}
      />
    );
  }, [dirChildren, item, state.filesystem.loaded, tableColumns]);

  return (
    <div>
      <div>
        <EuiPanel paddingSize="m">
          <EuiTitle size="xs">
            <span>
              {item ? (
                <>
                  {item.fullPath}&nbsp;
                  {item.action?.isPending && <EuiLoadingChart size="m" mono />}
                </>
              ) : (
                getEmptyValue()
              )}
            </span>
          </EuiTitle>
        </EuiPanel>
        <EuiSpacer size="l" />
      </div>

      <EuiPanel paddingSize="m" className="eui-yScroll" style={{ height: 'calc(100vh - 320px)' }}>
        {directoryContent}
      </EuiPanel>
    </div>
  );
});
DirectoryContent.displayName = 'DirectoryContent';
