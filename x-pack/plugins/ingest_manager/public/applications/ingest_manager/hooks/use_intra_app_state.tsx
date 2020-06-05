/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { memo, useContext, useMemo } from 'react';
import { ApplicationStart, ScopedHistory } from 'kibana/public';
import { useLocation } from 'react-router-dom';

interface IntraAppState {
  forRoute: string;
  returnTo?: Parameters<ApplicationStart['navigateToApp']>;
  returnToUrl?: string;
}

// PT: NOTE:
// The `returnTo` value above could also be a function that returns the type above, and is
// provided on input with relevant data for the given route. Example:
//
// type ReturnTo =
//   | ((params: {
//       event: string; // example: created, canceled
//       data: Datasource | AgentConfig; // the type applicable to the ingest route
//     }) => Parameters<ApplicationStart['navigateToApp']>)
//   | Parameters<ApplicationStart['navigateToApp']>;

const IntraAppStateContext = React.createContext<IntraAppState>({ forRoute: '' });
const wasHandled = new WeakSet<IntraAppState>();

export const IntraAppStateProvider = memo<{
  kibanaScopedHistory: ScopedHistory<IntraAppState>;
  children: React.ReactNode;
}>(({ kibanaScopedHistory, children }) => {
  const internalAppToAppState = useMemo<IntraAppState>(() => {
    return {
      forRoute: kibanaScopedHistory.location.hash.substr(1),
      returnTo: (kibanaScopedHistory.location?.state?.returnTo || undefined) as Parameters<
        ApplicationStart['navigateToApp']
      >,
      returnToUrl: kibanaScopedHistory.location?.state?.returnToUrl ?? '',
    };
  }, [kibanaScopedHistory.location]);
  return (
    <IntraAppStateContext.Provider value={internalAppToAppState}>
      {children}
    </IntraAppStateContext.Provider>
  );
});

export const useIntraAppState = (): IntraAppState | undefined => {
  const location = useLocation();
  const intraAppState = useContext(IntraAppStateContext);
  if (!intraAppState) {
    throw new Error('Hook called outside of IntraAppStateContext');
  }
  return useMemo((): IntraAppState | undefined => {
    // Due to the use of HashRouter in Ingest, we only want state to be returned
    // once so that it does not impact navigation to the page from within the
    // ingest app. side affect is that the browser back button would not work
    // consistently either :-(
    if (location.pathname === intraAppState.forRoute && !wasHandled.has(intraAppState)) {
      wasHandled.add(intraAppState);
      return intraAppState;
    }
  }, [intraAppState, location.pathname]);
};
