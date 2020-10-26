/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { memo } from 'react';
import { EuiPanel, EuiSpacer, EuiText } from '@elastic/eui';
import { IntegrationCustomComponent } from '../../../../../../../ingest_manager/common/types/extensions';

// FIXME:PT type is not correct
export const EndpointIntegrationCustom: IntegrationCustomComponent = memo(() => {
  return (
    <div>
      <EuiPanel paddingSize="l">
        <EuiText>{'Trusted Application'}</EuiText>
      </EuiPanel>
      <EuiSpacer />
      <EuiPanel paddingSize="l">
        <EuiText>{'Detection Rules Exception'}</EuiText>
      </EuiPanel>
    </div>
  );
});

EndpointIntegrationCustom.displayName = 'EditEndpointPolicy';
