/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { EuiFlyout, EuiFlyoutBody, EuiFlyoutFooter, EuiFlyoutHeader, EuiTitle } from '@elastic/eui';
import React, { memo, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { PolicyListAction } from '../../../../store/policy_list';
import { PolicyCreateForm } from './policy_create_form';

export const PolicyCreateFlyout = memo(() => {
  const dispatch = useDispatch<(action: PolicyListAction) => void>();

  const handleFlyoutClose = useCallback(() => dispatch({ type: 'userClosedPolicyCreateFlyout' }), [
    dispatch,
  ]);

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
      <EuiFlyoutFooter>Create button here</EuiFlyoutFooter>
    </EuiFlyout>
  );
});
