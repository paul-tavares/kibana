/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { memo, useMemo } from 'react';
import { EuiPanel, EuiSpacer, EuiText } from '@elastic/eui';
import { IntegrationCustomComponent } from '../../../../../../../ingest_manager/common/types/extensions';
import { MANAGEMENT_APP_ID } from '../../../../common/constants';
import { getTrustedAppsListPath } from '../../../../common/routing';
import { LinkToApp } from '../../../../../common/components/endpoint/link_to_app';
import { TrustedAppsListPageRouteState } from '../../../../../../common/endpoint/types';

// FIXME:PT type is not correct
export const EndpointIntegrationCustom: IntegrationCustomComponent = memo(() => {
  const trustedAppRouteState = useMemo<TrustedAppsListPageRouteState>(() => {
    return {
      backButtonLabel: 'Back to Endpoint Integration',
      // FIXME:PT hard coded paths below
      onBackButtonNavigateTo: [
        'ingestManager',
        { path: '#/integrations/detail/endpoint-0.16.0/custom' },
      ],
      backButtonUrl:
        'http://localhost:5601/app/ingestManager#/integrations/detail/endpoint-0.16.0/custom',
    };
  }, []);

  return (
    <div>
      <EuiPanel paddingSize="l">
        <LinkToApp
          appId={MANAGEMENT_APP_ID}
          appPath={getTrustedAppsListPath()}
          appState={trustedAppRouteState}
        >
          {'Trusted Application'}
        </LinkToApp>
      </EuiPanel>
      <EuiSpacer />
      <EuiPanel paddingSize="l">
        <EuiText>{'Detection Rules Exception'}</EuiText>
      </EuiPanel>
    </div>
  );
});

EndpointIntegrationCustom.displayName = 'EditEndpointPolicy';
