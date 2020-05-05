/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { memo, useMemo } from 'react';
import { EuiSteps } from '@elastic/eui';
import { EuiStepsProps } from '@elastic/eui/src/components/steps/steps';
import { AgentConfigSelection } from './agent_config_selection';
import { PolicyDefinition } from './policy_definition';
import { usePolicyListSelector } from '../../policy_hooks';
import { newPolicyConfigId } from '../../../../store/policy_list/selectors';

export const PolicyCreateForm = memo(() => {
  const configId = usePolicyListSelector(newPolicyConfigId);

  const steps = useMemo<EuiStepsProps['steps']>(() => {
    return [
      {
        title: 'Select Agent Configuration',
        children: <AgentConfigSelection />,
      },
      {
        title: 'Define Policy',
        status: configId ? undefined : 'disabled',
        children: <PolicyDefinition />,
      },
    ];
  }, [configId]);

  return <EuiSteps steps={steps} />;
});
