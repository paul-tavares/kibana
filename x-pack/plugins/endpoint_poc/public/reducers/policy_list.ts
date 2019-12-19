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
  serverReturnedPolicyCreateSuccess,
  serverReturnedPolicyListData,
  userClickedPolicyCreate,
  userClickedPolicyCreateButton,
  userEnteredPolicyCreateData,
  userExitedPolicyCreate,
} from '../actions/policy_list';

export interface IPolicyListState {
  list: Datasource[];
  isFetching: boolean;
  showCreate: boolean;
  createFormData: {
    name: string;
  };
  isCreating: boolean;
}

const initialPolicyListState: IPolicyListState = {
  list: [],
  isFetching: false,
  showCreate: false,
  createFormData: {
    name: '',
  },
  isCreating: false,
};

export const policyListReducer = (state = initialPolicyListState, action: IPolicyListActions) => {
  switch (action.type) {
    case serverReturnedPolicyListData.type:
      return { ...state, list: action.payload[0].list, isFetching: false };

    case isFetchingPolicyListData.type:
      return { ...state, isFetching: action.payload[0].isFetching };

    case userClickedPolicyCreate.type:
      return { ...state, showCreate: action.payload[0].showCreate };

    case userExitedPolicyCreate.type:
      return {
        ...state,
        showCreate: action.payload[0].showCreate,
        createFormData: { ...initialPolicyListState.createFormData },
        isCreating: false,
      };

    case userEnteredPolicyCreateData.type:
      return { ...state, createFormData: { ...state.createFormData, ...action.payload[0] } };

    case userClickedPolicyCreateButton.type:
      return { ...state, isCreating: true };

    case serverReturnedPolicyCreateSuccess.type:
      // FIXME: this should just make state that policy was created and let the policy flyout show a toaster message then it should close the flyout
      return { ...state, showCreate: false };

    default:
      return state;
  }
};
