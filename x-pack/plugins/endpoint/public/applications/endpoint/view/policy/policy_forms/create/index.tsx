/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import {
  EuiButton,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutFooter,
  EuiFlyoutHeader,
  EuiTitle,
} from '@elastic/eui';
import React, { memo, useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { PolicyListAction } from '../../../../store/policy_list';
import { PolicyCreateForm } from './policy_create_form';
import { usePolicyListSelector } from '../../policy_hooks';
import {
  hasRequiredNewPolicyInput,
  isCreatingNewPolicy,
  newPolicyDataForCreate,
  wasNewPolicyCreated,
} from '../../../../store/policy_list/selectors';

export const PolicyCreateFlyout = memo(() => {
  const dispatch = useDispatch<(action: PolicyListAction) => void>();
  const hasRequiredData = usePolicyListSelector(hasRequiredNewPolicyInput);
  const isCreating = usePolicyListSelector(isCreatingNewPolicy);
  const wasCreated = usePolicyListSelector(wasNewPolicyCreated);
  const newPolicyData = usePolicyListSelector(newPolicyDataForCreate);

  const handleFlyoutClose = useCallback(() => dispatch({ type: 'userClosedPolicyCreateFlyout' }), [
    dispatch,
  ]);

  const handleCreateButtonClick = useCallback(() => {
    if (newPolicyData) {
      dispatch({
        type: 'userClickExecuteCreatePolicy',
        payload: newPolicyData,
      });
    }
  }, [dispatch, newPolicyData]);

  useEffect(() => {
    if (wasCreated) {
      dispatch({ type: 'userClosedPolicyCreateFlyout' });
    }
  }, [dispatch, wasCreated]);

  if (wasCreated) {
    return <Redirect to="/policy" />;
  }

  return (
    <EuiFlyout onClose={handleFlyoutClose} size="s">
      <EuiFlyoutHeader>
        <EuiTitle size="s">
          <h2>Create Policy</h2>
        </EuiTitle>
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
        <PolicyCreateForm />
      </EuiFlyoutBody>
      <EuiFlyoutFooter>
        <EuiButton
          fill
          isDisabled={!hasRequiredData}
          onClick={handleCreateButtonClick}
          isLoading={isCreating}
        >
          Create
        </EuiButton>
      </EuiFlyoutFooter>
    </EuiFlyout>
  );
});
