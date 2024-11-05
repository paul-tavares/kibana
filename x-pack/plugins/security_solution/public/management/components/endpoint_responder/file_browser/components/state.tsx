/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { memo, createContext, type PropsWithChildren, useState, useContext } from 'react';
import type { FileBrowserState } from '../types';

type CurrentState = [FileBrowserState, React.Dispatch<React.SetStateAction<FileBrowserState>>];

const FileBrowserStateContext = createContext<null | CurrentState>(null);

export type FileBrowserStateProviderProps = PropsWithChildren<{}>;

export const FileBrowserStateProvider = memo<FileBrowserStateProviderProps>(({ children }) => {
  const state = useState<FileBrowserState>({
    filesystem: {
      type: 'directory',
      loaded: false,
    },
  });

  return (
    <FileBrowserStateContext.Provider value={state}>{children}</FileBrowserStateContext.Provider>
  );
});
FileBrowserStateProvider.displayName = 'FileBrowserStateProvider';

export const useFileBrowserState = (): CurrentState => {
  const state = useContext(FileBrowserStateContext);

  if (!state) {
    throw new Error(`FileBrowserStateContext not defined`);
  }

  return state;
};
