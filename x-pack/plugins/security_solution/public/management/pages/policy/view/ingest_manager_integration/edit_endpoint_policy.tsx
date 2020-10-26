/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { memo } from 'react';
import { IntegrationPolicyEditExtensionComponent } from '../../../../../../../ingest_manager/common/types/extensions';

export const EditEndpointPolicy: IntegrationPolicyEditExtensionComponent = memo(() => {
  return <h1>{'Editing Endpoint policy here'}</h1>;
});

EditEndpointPolicy.displayName = 'EditEndpointPolicy';
