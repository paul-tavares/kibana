/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { memo, useMemo } from 'react';
import { EuiSteps } from '@elastic/eui';
import { AgentConfigSelection } from './agent_config_selection';
import { PolicyDefinition } from './policy_definition';

export const PolicyCreateForm = memo(() => {
  const steps = useMemo(() => {
    return [
      {
        title: 'Select Agent Configuration',
        children: <AgentConfigSelection />,
      },
      {
        title: 'Define Policy',
        children: <PolicyDefinition />,
      },
    ];
  }, []);

  return <EuiSteps steps={steps} />;
});
