/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { ChangeEvent } from 'react';
import { EuiForm, EuiFormRow, EuiFieldText } from '@elastic/eui';
import { useDispatch, useSelector } from 'react-redux';
import { selectCreateFormData, selectIsCreating } from '../selectors/policy_list';
import { userEnteredPolicyCreateData } from '../actions/policy_list';

export const PolicyCreateForm = React.memo(() => {
  const dispatch = useDispatch();
  const formData = useSelector(selectCreateFormData);
  const isCreating = useSelector(selectIsCreating);

  const handleOnChange = ({ target: { name, value } }: ChangeEvent<HTMLInputElement>) => {
    dispatch(userEnteredPolicyCreateData({ [name]: value }));
  };

  return (
    <EuiForm>
      <EuiFormRow label="Name">
        <EuiFieldText
          value={formData.name}
          name="name"
          required
          onChange={handleOnChange}
          disabled={isCreating}
        />
      </EuiFormRow>
    </EuiForm>
  );
});
