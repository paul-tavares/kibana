/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { memo, useContext, useMemo } from 'react';
import { ApplicationStart, AppMountParameters } from 'kibana/public';
import { useLocation } from 'react-router-dom';

interface IntraAppState {
  forRoute: string;
  returnTo?: Parameters<ApplicationStart['navigateToApp']>;
}

const IntraAppStateContext = React.createContext<IntraAppState>({ forRoute: '' });

export const IntraAppStateProvider = memo<{
  kibanaScopedHistory: AppMountParameters['history'];
  children: React.ReactNode;
}>(({ kibanaScopedHistory, children }) => {
  const internalAppToAppState = useMemo<IntraAppState>(() => {
    return {
      forRoute: kibanaScopedHistory.location.hash.substr(1),
      returnTo: (kibanaScopedHistory.location.state || undefined) as Parameters<
        ApplicationStart['navigateToApp']
      >,
    };
  }, [kibanaScopedHistory.location.hash, kibanaScopedHistory.location.state]);
  return (
    <IntraAppStateContext.Provider value={internalAppToAppState}>
      {children}
    </IntraAppStateContext.Provider>
  );
});

export const useIntraAppState = (): IntraAppState | undefined => {
  const location = useLocation();
  const intraAppState = useContext(IntraAppStateContext);
  const appState = useMemo((): IntraAppState | undefined => {
    if (location.pathname === intraAppState.forRoute) {
      return intraAppState;
    }
  }, [intraAppState, location.pathname]);
  return appState;
};
