/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, {
  memo,
  createContext,
  type PropsWithChildren,
  useState,
  useContext,
  useEffect,
} from 'react';
import type { ResponseActionAgentType } from '../../../../../../common/endpoint/service/response_actions/constants';
import type { FileBrowserState, FilesystemItem } from '../types';

type CurrentState = [FileBrowserState, React.Dispatch<React.SetStateAction<FileBrowserState>>];

const FileBrowserStateContext = createContext<null | CurrentState>(null);

const FilesystemItemIdentifier = Symbol('filesystemItem');

export const createFilesystemItem = (overrides: Partial<FilesystemItem> = {}): FilesystemItem => {
  return Object.assign(Object.create({ [FilesystemItemIdentifier]: true }), {
    type: 'directory',
    loaded: false,
    loadedFromActionId: '',
    fullPath: '/',
    ...overrides,
  });
};

export const isFilesystemItem = (obj: object): obj is FilesystemItem => {
  return Boolean(obj[FilesystemItemIdentifier]);
};

export type FileBrowserStateProviderProps = PropsWithChildren<{
  agentId: string;
  agentType: ResponseActionAgentType;
}>;

export const FileBrowserStateProvider = memo<FileBrowserStateProviderProps>(
  ({ children, agentId, agentType }) => {
    const state = useState<FileBrowserState>({
      agentId,
      agentType,
      filesystem: createFilesystemItem(),
    });

    useEffect(() => {
      // If there was a change in agentId (should not happen), then reset state
      if (state[0].agentId !== agentId) {
        state[1]({
          agentId,
          agentType,
          filesystem: createFilesystemItem(),
        });
      }
    }, [agentId, agentType, state]);

    return (
      <FileBrowserStateContext.Provider value={state}>{children}</FileBrowserStateContext.Provider>
    );
  }
);
FileBrowserStateProvider.displayName = 'FileBrowserStateProvider';

export const useFileBrowserState = (): CurrentState => {
  const state = useContext(FileBrowserStateContext);

  if (!state) {
    throw new Error(`FileBrowserStateContext not defined`);
  }

  return state;
};
