/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { ServerApiError } from '../../types';
import { Immutable, PolicyData } from '../../../../../common/types';
import { GetAgentConfigsResponse } from '../../../../../../ingest_manager/common/types/rest_spec';

interface ServerReturnedPolicyListData {
  type: 'serverReturnedPolicyListData';
  payload: {
    policyItems: PolicyData[];
    total: number;
    pageSize: number;
    pageIndex: number;
  };
}

interface ServerFailedToReturnPolicyListData {
  type: 'serverFailedToReturnPolicyListData';
  payload: ServerApiError;
}

interface ServerReturnedAgentConfigsWithNoPolicyData {
  type: 'serverReturnedAgentConfigsWithNoPolicyData';
  payload: Immutable<GetAgentConfigsResponse>;
}

interface UserClickedPolicyCreateButton {
  type: 'userClickedPolicyCreateButton';
  payload: {
    /** if `true`, then form should be shown; else hide it */
    show: boolean;
  };
}

interface UserClosedPolicyCreateFlyout {
  type: 'userClosedPolicyCreateFlyout';
}

export type PolicyListAction =
  | ServerReturnedPolicyListData
  | ServerFailedToReturnPolicyListData
  | ServerReturnedAgentConfigsWithNoPolicyData
  | UserClickedPolicyCreateButton
  | UserClosedPolicyCreateFlyout;
