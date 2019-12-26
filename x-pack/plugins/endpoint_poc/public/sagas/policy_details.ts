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
  serverReturnedPolicyUpdateData,
  TFetchPolicyDetailsDataAction,
  TServerReturnedPolicyUpdateDataAction,
  TUserClickedPolicyUpdateButtonAction,
  userClickedPolicyUpdateButton,
} from '../actions/policy_details';

export const policyDetailsSaga = async (
  { actionsAndState, dispatch }: { actionsAndState: any; dispatch: any },
  context: AppMountContext
) => {
  const httpGet = context.core.http.get;
  const httpPut = context.core.http.put;
  // const httpPost = context.core.http.post;

  const reMatchPolicyViewUrl = new RegExp(
    `${context.core.http.basePath.get()}/app/endpoint_poc/policies/view/[0-9a-zA-Z]`
  );
  const isOnPage = (href: string) => {
    return reMatchPolicyViewUrl.test(href);
  };

  for await (const {
    action,
    // userIsOnPageAndLoggedIn,
    // href,
    // state,
    // shouldInitialize,
  } of withPageNavigationStatus({
    actionsAndState,
    isOnPage,
  })) {
    // FIXME: issue with `widthPageNavigationStatus()` and value returned for `userIsOnPageAndLoggedIn`
    //    seems to be out of sync with actual href.  I think issue is due to the fact that
    //    Components are rendered PRIOR to ReactRouter emitting its `LOCATION_CHANGE` event.
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
      } else if (action.type === userClickedPolicyUpdateButton.type) {
        try {
          const {
            id,
            item: datasource,
          } = (action as TUserClickedPolicyUpdateButtonAction).payload[0];
          const response = await httpPut<TServerReturnedPolicyUpdateDataAction['payload'][0]>(
            `/api/ingest/datasources/${id}`,
            {
              body: JSON.stringify({ datasource }),
            }
          );
          dispatch(serverReturnedPolicyUpdateData(response));
        } catch (error) {
          // TODO: dispatch an error action
          throw new Error(error);
        }
      }
    }
  }
};
