/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { memo } from 'react';
import { EuiHorizontalRule } from '@elastic/eui';
import { IntegrationPolicyEditExtensionComponent } from '../../../../../../../ingest_manager/common/types/extensions';
import { PolicyDetailsForm } from '../policy_details_form';

// FIXME:PT type is not correct
export const EditEndpointPolicy: IntegrationPolicyEditExtensionComponent = memo(
  ({ integrationPolicy, onChange }) => {
    return (
      <>
        <EuiHorizontalRule />
        <PolicyDetailsForm />
      </>
    );
  }
);

EditEndpointPolicy.displayName = 'EditEndpointPolicy';
