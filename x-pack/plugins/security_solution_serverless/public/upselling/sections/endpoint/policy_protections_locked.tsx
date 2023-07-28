/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { EuiEmptyPrompt, EuiIcon, EuiText } from '@elastic/eui';
import React, { memo } from 'react';

export const PolicyProtectionsLocked = memo((props) => {
  return (
    <EuiEmptyPrompt
      icon={<EuiIcon type="logoSecurity" size="xl" />}
      color="plain"
      hasShadow={false}
      title={
        <EuiText>
          <h3>{'Do more with Security!'}</h3>
        </EuiText>
      }
      body={<p>{'Upgrade your project with Endpoint Essentials addon to enable protections'}</p>}
    />
  );
});
PolicyProtectionsLocked.displayName = 'PolicyProtectionsLocked';
