/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { AppMountContext } from 'kibana/public';
import { withPageNavigationStatus } from './common';
import { hrefIsForPath } from '../concerns/routing';
import {
  IPolicyListServerResponse,
  isFetchingPolicyListData,
  serverReturnedPolicyListData,
} from '../actions/policy_list';

export const policyListSaga = async (
  { actionsAndState, dispatch }: { actionsAndState: any; dispatch: any },
  context: AppMountContext
) => {
  function isOnPage(href: any) {
    const isOnPageResponse: boolean = hrefIsForPath(
      href,
      `${context.core.http.basePath.get()}/app/endpoint_poc/policies`
    );
    return isOnPageResponse;
  }

  for await (const {
    // action,
    userIsOnPageAndLoggedIn,
    // href,
    // state,
    shouldInitialize,
  } of withPageNavigationStatus({
    actionsAndState,
    isOnPage,
  })) {
    if (userIsOnPageAndLoggedIn) {
      if (shouldInitialize) {
        dispatch(isFetchingPolicyListData({ isFetching: true }));
        try {
          // FIXME: need to have ability to filter datasources by something that identifies the ones for Endpoint
          const response = await context.core.http.get<IPolicyListServerResponse>(
            '/api/ingest/datasources'
          );
          dispatch(serverReturnedPolicyListData(response));
        } catch (error) {
          // TODO: dispatch an error action
          throw new Error(error);
        }
      }
    }
  }
};
