/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { memo } from 'react';
import { useFileBrowserState } from './state';
import { Directory } from './directory';

export interface DirectoryTreeProps {
  foo?: string;
}

export const DirectoryTree = memo<DirectoryTreeProps>((props) => {
  const [state] = useFileBrowserState();

  return <Directory item={state.filesystem} />;
});
DirectoryTree.displayName = 'DirectoryTree';
