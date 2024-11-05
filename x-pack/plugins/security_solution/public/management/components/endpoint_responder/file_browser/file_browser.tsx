/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { memo } from 'react';
import { EuiCallOut, EuiFlexGroup, EuiFlexItem } from '@elastic/eui';
import { FileBrowserStateProvider } from './components/state';
import { DirectoryTree } from './components/directory_tree';
import { DirectoryContent } from './components/directory_content';
import type { ResponseActionAgentType } from '../../../../../common/endpoint/service/response_actions/constants';

export interface FileBrowserProps {
  agentId: string;
  agentType: ResponseActionAgentType;
}

export const FileBrowser = memo<FileBrowserProps>(({ agentType, agentId }) => {
  if (agentType !== 'endpoint') {
    return (
      <EuiCallOut color="primary">
        {'File browser is only currently supported by hosts running Elastic Defend'}
      </EuiCallOut>
    );
  }

  return (
    <FileBrowserStateProvider agentId={agentId} agentType={agentType}>
      <EuiFlexGroup wrap={false} responsive={false} gutterSize="s">
        {/* FIXME:PT add styles and remove `style` tag */}
        <EuiFlexItem grow={false} style={{ width: '30%' }}>
          <DirectoryTree />
        </EuiFlexItem>
        <EuiFlexItem>
          <DirectoryContent />
        </EuiFlexItem>
      </EuiFlexGroup>
    </FileBrowserStateProvider>
  );
});
FileBrowser.displayName = 'FileBrowser';
