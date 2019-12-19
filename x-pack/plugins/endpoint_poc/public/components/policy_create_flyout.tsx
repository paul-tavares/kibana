/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import React, { useCallback, useEffect } from 'react';
import {
  EuiFlyout,
  EuiFlyoutHeader,
  EuiTitle,
  EuiFlyoutBody,
  EuiFlyoutFooter,
  EuiFlexGroup,
  EuiFlexItem,
  EuiButtonEmpty,
  EuiButton,
} from '@elastic/eui';
import { useDispatch, useSelector } from 'react-redux';
import { userClickedPolicyCreateButton, userExitedPolicyCreate } from '../actions/policy_list';
import { PolicyCreateForm } from './policy_create_form';
import { isCreateFormDataValid, selectIsCreating } from '../selectors/policy_list';

export const PolicyCreateFlyout = React.memo(() => {
  const dispatch = useDispatch();
  const isFormDataValid = useSelector(isCreateFormDataValid);
  const isCreating = useSelector(selectIsCreating);
  const exitPolicyFloyout = useCallback(() => {
    dispatch(userExitedPolicyCreate({ showCreate: false }));
  }, [dispatch]);
  const handleOnClose = () => {
    exitPolicyFloyout();
  };
  const handleCreateOnClick = () => {
    dispatch(userClickedPolicyCreateButton());
  };

  // When this component unmounts, ensure we reset State
  useEffect(() => exitPolicyFloyout, [exitPolicyFloyout]);

  return (
    <EuiFlyout onClose={handleOnClose} size="s">
      <EuiFlyoutHeader hasBorder aria-labelledby="FleetCreatePolicyFlyoutTitle">
        <EuiTitle size="m">
          <h2>Create New Security Policy</h2>
        </EuiTitle>
      </EuiFlyoutHeader>

      <EuiFlyoutBody>
        <PolicyCreateForm />
      </EuiFlyoutBody>

      <EuiFlyoutFooter>
        <EuiFlexGroup justifyContent="spaceBetween">
          <EuiFlexItem grow={false}>
            <EuiButtonEmpty iconType="cross" onClick={handleOnClose} flush="left">
              Cancel
            </EuiButtonEmpty>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton
              fill
              isLoading={isCreating}
              isDisabled={!isFormDataValid}
              onClick={handleCreateOnClick}
            >
              Create
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlyoutFooter>
    </EuiFlyout>
  );
});
