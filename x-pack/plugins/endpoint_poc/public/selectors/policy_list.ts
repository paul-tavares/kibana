/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { GlobalState } from '../types';
import { IPolicyListState } from '../reducers/policy_list';

const selectPolicyListState = (state: GlobalState) => state.policyList as IPolicyListState;

export const selectList = (state: GlobalState) => selectPolicyListState(state).list;
export const selectIsFetching = (state: GlobalState) => selectPolicyListState(state).isFetching;

export const policySelectors = {
  selectList,
  selectIsFetching,
};
