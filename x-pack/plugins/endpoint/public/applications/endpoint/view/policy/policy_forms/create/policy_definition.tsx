/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { memo, useCallback, ChangeEventHandler } from 'react';
import { EuiCallOut, EuiForm, EuiFormRow, EuiFieldText, EuiText } from '@elastic/eui';
import { useDispatch } from 'react-redux';
import { usePolicyListSelector } from '../../policy_hooks';
import {
  newPolicyConfigId,
  newPolicyDescription,
  newPolicyName,
} from '../../../../store/policy_list/selectors';
import { PolicyListAction } from '../../../../store/policy_list';

export const PolicyDefinition = memo(() => {
  const dispatch = useDispatch<(a: PolicyListAction) => void>();
  const configId = usePolicyListSelector(newPolicyConfigId);
  const policyName = usePolicyListSelector(newPolicyName);
  const policyDescription = usePolicyListSelector(newPolicyDescription);

  const handleFieldOnChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
    event => {
      dispatch({
        type: 'userEnteredPolicyInformation',
        payload: {
          [event.target.name]: event.target.value,
        },
      });
    },
    [dispatch]
  );

  if (!configId) {
    return <EuiCallOut size="s" title="Select an agent configuration" iconType="help" />;
  }

  return (
    <EuiForm>
      <EuiFormRow label="Name">
        <EuiFieldText
          name="policyName"
          value={policyName}
          placeholder="Choose a name"
          onChange={handleFieldOnChange}
        />
      </EuiFormRow>
      <EuiFormRow
        label="Description"
        labelAppend={
          <EuiText color="subdued" size="s">
            Optional
          </EuiText>
        }
      >
        <EuiFieldText
          name="policyDescription"
          value={policyDescription}
          onChange={handleFieldOnChange}
        />
      </EuiFormRow>
    </EuiForm>
  );
});
