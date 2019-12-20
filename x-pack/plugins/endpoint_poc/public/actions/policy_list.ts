/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { actionCreatorFactory } from '../lib/action_creator';
import { Datasource } from '../../../../legacy/plugins/ingest/server/libs/types';
// TODO: problem? circular dependency below with reducers/policy_list (for type imports)
import { IPolicyListState } from '../reducers/policy_list';

export interface IPolicyListServerResponse {
  list: Datasource[];
  success: boolean;
  total: number;
  page: number;
  perPage: number;
}

export interface IPolicyCreateServerResponse {
  item: Datasource;
  success: boolean;
  action: string;
}

export const serverReturnedPolicyListData = actionCreatorFactory<
  'serverReturnedPolicyListData',
  [IPolicyListServerResponse]
>('serverReturnedPolicyListData');

export const isFetchingPolicyListData = actionCreatorFactory<
  'isFetchingPolicyListData',
  [{ isFetching: boolean }]
>('isFetchingPolicyListData');

export const userClickedPolicyCreate = actionCreatorFactory<
  'userClickedPolicyCreate',
  [{ showCreate: boolean }]
>('userClickedPolicyCreate');

export const userExitedPolicyCreate = actionCreatorFactory<
  'userExitedPolicyCreate',
  [{ showCreate: boolean }]
>('userExitedPolicyCreate');

export const userEnteredPolicyCreateData = actionCreatorFactory<
  'userEnteredPolicyCreateData',
  [Partial<IPolicyListState['createFormData']>]
>('userEnteredPolicyCreateData');

export const userClickedPolicyCreateButton = actionCreatorFactory<
  'userClickedPolicyCreateButton',
  []
>('userClickedPolicyCreateButton');

export const userClickedPolicyListRefreshButton = actionCreatorFactory<
  'userClickedPolicyListRefreshButton',
  []
>('userClickedPolicyListRefreshButton');

export const serverReturnedPolicyCreateSuccess = actionCreatorFactory<
  'serverReturnedPolicyCreateSuccess',
  [IPolicyCreateServerResponse]
>('serverReturnedPolicyCreateSuccess');

export const policyListActions = {
  serverReturnedPolicyListData,
  isFetchingPolicyListData,
  userClickedPolicyCreate,
  userExitedPolicyCreate,
  userEnteredPolicyCreateData,
  userClickedPolicyCreateButton,
  serverReturnedPolicyCreateSuccess,
  userClickedPolicyListRefreshButton,
};

export type IPolicyListActions =
  | ReturnType<typeof serverReturnedPolicyListData>
  | ReturnType<typeof isFetchingPolicyListData>
  | ReturnType<typeof userClickedPolicyCreate>
  | ReturnType<typeof userExitedPolicyCreate>
  | ReturnType<typeof userEnteredPolicyCreateData>
  | ReturnType<typeof userClickedPolicyCreateButton>
  | ReturnType<typeof userClickedPolicyListRefreshButton>
  | ReturnType<typeof serverReturnedPolicyCreateSuccess>;
