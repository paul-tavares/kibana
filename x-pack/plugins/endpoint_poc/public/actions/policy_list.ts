/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { actionCreatorFactory } from '../lib/action_creator';
import { Datasource } from '../../../../legacy/plugins/ingest/server/libs/types';

export interface IPolicyListServerResponse {
  list: Datasource[];
  success: boolean;
  total: number;
  page: number;
  perPage: number;
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

export const policyListActions = {
  serverReturnedPolicyListData,
  isFetchingPolicyListData,
  userClickedPolicyCreate,
  userExitedPolicyCreate,
};

export type IPolicyListActions =
  | ReturnType<typeof serverReturnedPolicyListData>
  | ReturnType<typeof isFetchingPolicyListData>
  | ReturnType<typeof userClickedPolicyCreate>
  | ReturnType<typeof userExitedPolicyCreate>;
