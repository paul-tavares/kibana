/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { memo, useMemo } from 'react';
import { EuiEmptyPrompt, EuiText } from '@elastic/eui';
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

  if (!state.filesystem.loaded) {
    return (
      <EuiEmptyPrompt
        title={<h3>{'Loading'}</h3>}
        body={<EuiText>{'Loading directory structure from host'}</EuiText>}
      />
    );
  }

  if (!state.showDetailsFor) {
    return <EuiEmptyPrompt body={<EuiText>{'Click on a directory to see its content'}</EuiText>} />;
  }

  if (dirChildren.length === 0) {
    return (
      <EuiEmptyPrompt
        title={<h3>{'Empty'}</h3>}
        body={<EuiText>{'Directory does not have any content'}</EuiText>}
      />
    );
  }

  return (
    <div>
      {dirChildren.map((childItem) => {
        return <div key={childItem.fullPath}>{childItem.meta?.name}</div>;
      })}
    </div>
  );
});
DirectoryContent.displayName = 'DirectoryContent';
