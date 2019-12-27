/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import {
  IPolicyDetailsServerResponse,
  IPolicyDetailsActions,
  isFetchingPolicyDetailsData,
  serverReturnedPolicyDetailsData,
  serverReturnedPolicyUpdateData,
  TIsFetchingPolicyDetailsDataAction,
  TServerReturnedPolicyDetailsDataAction,
  TServerReturnedPolicyUpdateDataAction,
  TUserUpdatedPolicyDetailsDataAction,
  userClickedPolicyUpdateButton,
  userExitedPolicyDetails,
  userUpdatedPolicyDetailsData,
  IDatasource,
  TUserClickedFleetActionButtonAction,
  userClickedFleetActionButton,
} from '../actions/policy_details';

export enum EPolicyDetailsFloyout {
  none,
  viewFleetPolicies,
  assignFleetPolicies,
  unAssignFleetPolicies,
}

export interface IPolicyDetailsState {
  item: IPolicyDetailsServerResponse['item'];
  wasFetched: boolean;
  wasFound: boolean;
  wasUpdated: boolean;
  isFetching: boolean;
  showFlyout: EPolicyDetailsFloyout;
}

const createPolicyDetailsState = (): IPolicyDetailsState => ({
  item: null,
  wasFetched: false,
  wasFound: false,
  wasUpdated: false,
  isFetching: false,
  showFlyout: EPolicyDetailsFloyout.none,
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
        isFetching: false,
      };

    case userExitedPolicyDetails.type:
      return { ...createPolicyDetailsState() };

    case userUpdatedPolicyDetailsData.type:
      return {
        ...state,
        item: {
          ...(state.item as IDatasource),
          ...(action as TUserUpdatedPolicyDetailsDataAction).payload[0],
        },
        wasUpdated: true,
      };

    case userClickedPolicyUpdateButton.type:
      return { ...state, isFetching: true };

    case serverReturnedPolicyUpdateData.type:
      return {
        ...state,
        item: (action as TServerReturnedPolicyUpdateDataAction).payload[0].item,
        isFetching: false,
        wasUpdated: false,
      };

    case userClickedFleetActionButton.type:
      return { ...state, ...(action as TUserClickedFleetActionButtonAction).payload[0] };

    default:
      return state;
  }
};
