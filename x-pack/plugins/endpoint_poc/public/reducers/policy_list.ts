/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

// TODO: is this even legal? to reference a type from another plugin
import { Datasource } from '../../../../legacy/plugins/ingest/server/libs/types';
import {
  IPolicyListActions,
  isFetchingPolicyListData,
  serverReturnedPolicyListData,
  userClickedPolicyCreate,
  userExitedPolicyCreate,
} from '../actions/policy_list';

export interface IPolicyListState {
  list: Datasource[];
  isFetching: boolean;
  showCreate: boolean;
}

const initialPolicyListState: IPolicyListState = {
  list: [],
  isFetching: false,
  showCreate: false,
};

export const policyListReducer = (state = initialPolicyListState, action: IPolicyListActions) => {
  switch (action.type) {
    case serverReturnedPolicyListData.type:
      return { ...state, list: action.payload[0].list, isFetching: false };

    case isFetchingPolicyListData.type:
      return { ...state, isFetching: action.payload[0].isFetching };

    case userClickedPolicyCreate.type:
    case userExitedPolicyCreate.type:
      return { ...state, showCreate: action.payload[0].showCreate };

    default:
      return state;
  }
};
