/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { GlobalState } from '../types';
import { IPolicyDetailsState } from '../reducers/policy_details';

const selectPolicyDetailsState = (s: GlobalState) => s.policyDetails as IPolicyDetailsState;

export const selectItem = (s: GlobalState) => selectPolicyDetailsState(s).item;

export const selectIsEndpointPolicy = (s: GlobalState) =>
  selectPolicyDetailsState(s).item?.package.name === 'endpoint';

export const selectWasFound = (s: GlobalState) => selectPolicyDetailsState(s).wasFound;

export const selectWasFetched = (s: GlobalState) => selectPolicyDetailsState(s).wasFetched;

export const selectIsFetching = (s: GlobalState) => selectPolicyDetailsState(s).isFetching;
