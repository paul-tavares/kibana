/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { memo } from 'react';
import { usePolicyListSelector } from '../../policy_hooks';
import { newPolicyConfigId } from '../../../../store/policy_list/selectors';

export const PolicyDefinition = memo(() => {
  const configId = usePolicyListSelector(newPolicyConfigId);

  return (configId && <div>Policy definition here</div>) || null;
});
