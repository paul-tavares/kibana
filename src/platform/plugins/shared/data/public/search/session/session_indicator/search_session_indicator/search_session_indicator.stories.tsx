/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import React from 'react';
import { SearchSessionIndicator } from './search_session_indicator';
import { SearchSessionState } from '../../search_session_state';

export default {
  title: 'components/SearchSessionIndicator',
};

const DefaultComponent = () => {
  const [searchSessionName, setSearchSessionName] = React.useState('Discover session');

  const saveSearchSessionNameFn = (newName: string) =>
    new Promise((resolve) => {
      setTimeout(() => {
        setSearchSessionName(newName);
        resolve(void 0);
      }, 1000);
    });

  return (
    <>
      <div>
        <SearchSessionIndicator state={SearchSessionState.Loading} startedTime={new Date()} />
      </div>
      <div>
        <SearchSessionIndicator
          state={SearchSessionState.Completed}
          startedTime={new Date()}
          completedTime={new Date()}
        />
      </div>
      <div>
        <SearchSessionIndicator
          state={SearchSessionState.BackgroundLoading}
          searchSessionName={searchSessionName}
          saveSearchSessionNameFn={saveSearchSessionNameFn}
          startedTime={new Date()}
        />
      </div>
      <div>
        <SearchSessionIndicator
          state={SearchSessionState.BackgroundCompleted}
          searchSessionName={searchSessionName}
          saveSearchSessionNameFn={saveSearchSessionNameFn}
          startedTime={new Date()}
          completedTime={new Date()}
        />
      </div>
      <div>
        <SearchSessionIndicator
          state={SearchSessionState.Restored}
          searchSessionName={searchSessionName}
          saveSearchSessionNameFn={saveSearchSessionNameFn}
          startedTime={new Date()}
          completedTime={new Date()}
        />
      </div>
      <div>
        <SearchSessionIndicator
          state={SearchSessionState.Canceled}
          startedTime={new Date()}
          canceledTime={new Date()}
        />
      </div>
      <div>
        <SearchSessionIndicator
          state={SearchSessionState.Completed}
          saveDisabled={true}
          startedTime={new Date()}
          completedTime={new Date()}
          saveDisabledReasonText={
            'Search results have expired and it is no longer possible to save this search session'
          }
        />
      </div>
    </>
  );
};

export const Default = {
  name: 'default',
  render: () => <DefaultComponent />,
};
