/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React from 'react';
import { IntegrationPolicyEditExtensionComponent } from '../../../../ingest_manager/common/types/extensions';

export const IngestEditEndpointPolicy = React.lazy<IntegrationPolicyEditExtensionComponent>(() =>
  import(
    '../pages/policy/view/ingest_manager_integration/edit_endpoint_policy'
  ).then((response) => ({ default: response.EditEndpointPolicy }))
);
