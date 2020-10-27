/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React from 'react';
import { CoreStart } from 'kibana/public';
import { IntegrationPolicyEditExtensionComponent } from '../../../../ingest_manager/common/types/extensions';
import { StartPlugins } from '../../types';

export const getIngestEditEndpointPolicyLazyComponent = (
  coreStart: CoreStart,
  depsStart: Pick<StartPlugins, 'data' | 'ingestManager'>
) => {
  return React.lazy<IntegrationPolicyEditExtensionComponent>(async () => {
    const [{ withSecurityContext }, { EditEndpointPolicy }] = await Promise.all([
      import('./with_security_context'),

      /* webpackChunkName: "ingestEditEndpointPolicy" */ import(
        '../pages/policy/view/ingest_manager_integration/edit_endpoint_policy'
      ),
    ]);

    return {
      default: withSecurityContext({
        coreStart,
        depsStart,
        WrappedComponent: EditEndpointPolicy,
      }),
    };
  });
};
