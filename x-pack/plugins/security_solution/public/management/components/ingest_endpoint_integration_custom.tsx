/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React from 'react';
import { IntegrationCustomComponent } from '../../../../ingest_manager/common/types/extensions';

export const IngestEndpointIntegrationCustom = React.lazy<IntegrationCustomComponent>(() =>
  /* webpackChunkName: "ingestEndpointIntegrationCustom" */ import(
    '../pages/policy/view/ingest_manager_integration/endpoint_integration_custom'
  ).then((response) => ({ default: response.EndpointIntegrationCustom }))
);
