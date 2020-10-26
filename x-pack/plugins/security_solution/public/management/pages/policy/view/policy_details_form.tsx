/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { EuiSpacer, EuiText } from '@elastic/eui';
import { FormattedMessage } from '@kbn/i18n/react';
import React, { memo } from 'react';
import { MalwareProtections } from './policy_forms/protections/malware';
import { LinuxEvents, MacEvents, WindowsEvents } from './policy_forms/events';

export const PolicyDetailsForm = memo(() => {
  return (
    <>
      <EuiText size="xs" color="subdued">
        <h4>
          <FormattedMessage
            id="xpack.securitySolution.endpoint.policy.details.protections"
            defaultMessage="Protections"
          />
        </h4>
      </EuiText>

      <EuiSpacer size="xs" />
      <MalwareProtections />
      <EuiSpacer size="l" />

      <EuiText size="xs" color="subdued">
        <h4>
          <FormattedMessage
            id="xpack.securitySolution.endpoint.policy.details.settings"
            defaultMessage="Settings"
          />
        </h4>
      </EuiText>

      <EuiSpacer size="xs" />
      <WindowsEvents />
      <EuiSpacer size="l" />
      <MacEvents />
      <EuiSpacer size="l" />
      <LinuxEvents />
    </>
  );
});

PolicyDetailsForm.displayName = 'PolicyDetailsForm';
