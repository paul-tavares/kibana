/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { memo, useMemo } from 'react';
import type { EuiBasicTableColumn } from '@elastic/eui';
import {
  EuiPanel,
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
import { FormattedDate } from '../../../../../common/components/formatted_date';
import { getEmptyValue } from '../../../../../common/components/empty_value';
import type { FilesystemItem } from '../types';
import { useFileBrowserState } from './state';

export interface DirectoryContentProps {
  foo?: string;
}

export const DirectoryContent = memo<DirectoryContentProps>((props) => {
  const [state] = useFileBrowserState();
  const dirChildren: FilesystemItem[] = useMemo(() => {
    return Object.values(state.showDetailsFor?.contents ?? {});
  }, [state.showDetailsFor]);
  const item = useMemo(() => {
    return state.showDetailsFor;
  }, [state.showDetailsFor]);

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
    ];
  }, []);

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
          // TODO:PT implement
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
      {item && (
        <div>
          <EuiPanel paddingSize="m">
            <EuiTitle size="xs">
              <span>
                {item.fullPath}
                {item.action?.isPending && <EuiLoadingChart size="m" mono />}
              </span>
            </EuiTitle>
          </EuiPanel>
          <EuiSpacer />
        </div>
      )}

      <div>{directoryContent}</div>
    </div>
  );
});
DirectoryContent.displayName = 'DirectoryContent';
