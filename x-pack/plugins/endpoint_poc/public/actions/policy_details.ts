/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { actionCreatorFactory } from '../lib/action_creator';
import { Datasource } from '../../../../legacy/plugins/ingest/server/libs/types';

export interface IPolicyDetailsServerResponse {
  item: Datasource | null;
  success: boolean;
}

export const fetchPolicyDetailsData = actionCreatorFactory<
  'fetchPolicyDetailsData',
  [{ policyId: string }]
>('fetchPolicyDetailsData');

export type TFetchPolicyDetailsDataAction = ReturnType<typeof fetchPolicyDetailsData>;

export const isFetchingPolicyDetailsData = actionCreatorFactory<
  'isFetchingPolicyDetailsData',
  [{ isFetching: boolean }]
>('isFetchingPolicyDetailsData');

export type TIsFetchingPolicyDetailsDataAction = ReturnType<typeof isFetchingPolicyDetailsData>;

export const serverReturnedPolicyDetailsData = actionCreatorFactory<
  'serverReturnedPolicyDetailsData',
  [IPolicyDetailsServerResponse]
>('serverReturnedPolicyDetailsData');

export type TServerReturnedPolicyDetailsDataAction = ReturnType<
  typeof serverReturnedPolicyDetailsData
>;

export const userExitedPolicyDetails = actionCreatorFactory<'userExitedPolicyDetails', []>(
  'userExitedPolicyDetails'
);

export type TUserExitedPolicyDetailsAction = ReturnType<typeof userExitedPolicyDetails>;

export type IPolicyDetailsActions =
  | TServerReturnedPolicyDetailsDataAction
  | TFetchPolicyDetailsDataAction
  | TIsFetchingPolicyDetailsDataAction
  | TUserExitedPolicyDetailsAction;
