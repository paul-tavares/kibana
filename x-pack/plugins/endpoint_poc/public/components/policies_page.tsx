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
  EuiButton,
} from '@elastic/eui';
import { Route, RouteComponentProps, withRouter } from 'react-router-dom';
import { PolicyList } from './policy_list';
import { PolicyDetail } from './policy_detail';
import { PolicyCreate } from './policy_create';

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

const CreatePolicyButton = withRouter(({ history }: RouteComponentProps) => {
  return <EuiButton onClick={() => history.push('/policies/create')}>Create Policy</EuiButton>;
});

const ListView = React.memo(() => {
  return (
    <PageView title="Endpoint Security Policies">
      <CreatePolicyButton />
      <PolicyList />
    </PageView>
  );
});

const DetailView = React.memo(() => {
  return (
    <PageView title="Policy: Name here">
      <PolicyDetail />
    </PageView>
  );
});

const CreateView = React.memo(() => {
  return (
    <PageView title="Create Policy">
      <PolicyCreate />
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
        <Route path="/policies/view/:policyId" exact component={DetailView} />
        <Route path="/policies/create" exact component={CreateView} />
      </EuiPageContent>
    </EuiPageBody>
  );
});
