/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { AppMountContext } from 'kibana/public';
import { withPageNavigationStatus } from './common';
import {
  fetchPolicyDetailsData,
  IPolicyDetailsServerResponse,
  isFetchingPolicyDetailsData,
  serverReturnedPolicyDetailsData,
  TFetchPolicyDetailsDataAction,
} from '../actions/policy_details';

export const policyDetailsSaga = async (
  { actionsAndState, dispatch }: { actionsAndState: any; dispatch: any },
  context: AppMountContext
) => {
  const httpGet = context.core.http.get;
  // const httpPost = context.core.http.post;

  const reMatchPolicyViewUrl = new RegExp(
    `${context.core.http.basePath.get()}/app/endpoint_poc/policies/view/[0-9a-zA-Z]`
  );
  const isOnPage = (href: string) => {
    return reMatchPolicyViewUrl.test(href);
  };

  for await (const {
    action,
    userIsOnPageAndLoggedIn,
    href,
    // state,
    // shouldInitialize,
  } of withPageNavigationStatus({
    actionsAndState,
    isOnPage,
  })) {
    if (isOnPage(location.href)) {
      if (action.type === fetchPolicyDetailsData.type) {
        dispatch(isFetchingPolicyDetailsData({ isFetching: true }));

        try {
          const response = await httpGet<IPolicyDetailsServerResponse>(
            `/api/ingest/datasources/${
              (action as TFetchPolicyDetailsDataAction).payload[0].policyId
            }`
          );
          dispatch(serverReturnedPolicyDetailsData(response));
        } catch (error) {
          // TODO: dispatch an error action
          throw new Error(error);
        }
      }
      // else if (action.type === userClickedPolicyCreateButton.type) {
      //   try {
      // const response = await httpPost('/api/ingest/datasources', {
      //   body: createFakeDataSourcePayloadJsonString(
      //     (state as GlobalState).policyList.createFormData.name
      //   ),
      // });
      // dispatch(serverReturnedPolicyCreateSuccess(response));
      // } catch (error) {
      //   // FIXME: handle errors
      //   throw new Error(error);
      // }
      // }
    }
  }
};
