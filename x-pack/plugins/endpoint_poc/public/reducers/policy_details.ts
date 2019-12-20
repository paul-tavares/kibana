/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { Datasource } from '../../../../legacy/plugins/ingest/server/libs/types';
import {
  IPolicyDetailsActions,
  isFetchingPolicyDetailsData,
  serverReturnedPolicyDetailsData,
  TIsFetchingPolicyDetailsDataAction,
  TServerReturnedPolicyDetailsDataAction,
  userExitedPolicyDetails,
} from '../actions/policy_details';

export interface IPolicyDetailsState {
  item: Datasource | null;
  wasFetched: boolean;
  wasFound: boolean;
  isFetching: boolean;
}

const createPolicyDetailsState = (): IPolicyDetailsState => ({
  item: null,
  wasFetched: false,
  wasFound: false,
  isFetching: false,
});

export const policyDetailsReducer = (
  state = createPolicyDetailsState(),
  action: IPolicyDetailsActions
): IPolicyDetailsState => {
  switch (action.type) {
    case isFetchingPolicyDetailsData.type:
      return {
        ...state,
        isFetching: (action as TIsFetchingPolicyDetailsDataAction).payload[0].isFetching,
      };
    case serverReturnedPolicyDetailsData.type:
      const item = (action as TServerReturnedPolicyDetailsDataAction).payload[0].item;
      return {
        ...state,
        item,
        wasFetched: true,
        wasFound: !!item,
      };
    case userExitedPolicyDetails.type:
      return { ...createPolicyDetailsState() };
    default:
      return state;
  }
};
