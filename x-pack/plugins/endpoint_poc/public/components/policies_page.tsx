/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { ReactElement } from 'react';
import {
  EuiPageBody,
  EuiPageHeader,
  EuiPageHeaderSection,
  EuiTitle,
  EuiPageContent,
  EuiPageContentHeader,
  EuiPageContentHeaderSection,
  EuiPageContentBody,
} from '@elastic/eui';
import { Route } from 'react-router-dom';
import { PolicyList } from './policy_list';

const PageView = React.memo<{ title: string; children: ReactElement }>(({ title, children }) => {
  return (
    <>
      {title ? (
        <EuiPageContentHeader>
          <EuiPageContentHeaderSection>
            <EuiTitle>
              <h2>{title}</h2>
            </EuiTitle>
          </EuiPageContentHeaderSection>
        </EuiPageContentHeader>
      ) : (
        ''
      )}
      <EuiPageContentBody>{children}</EuiPageContentBody>
    </>
  );
});

const ListView = React.memo(() => {
  return (
    <PageView title="Endpoint Security Policies">
      <PolicyList />
    </PageView>
  );
});

export const PoliciesPage = React.memo(() => {
  return (
    <EuiPageBody>
      <EuiPageHeader>
        <EuiPageHeaderSection>
          <EuiTitle size="l">
            <h1>Policies</h1>
          </EuiTitle>
        </EuiPageHeaderSection>
      </EuiPageHeader>
      <EuiPageContent>
        <Route path="/policies" exact component={ListView} />
      </EuiPageContent>
    </EuiPageBody>
  );
});
