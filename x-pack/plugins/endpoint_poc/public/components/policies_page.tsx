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
import { Route, withRouter } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { PolicyList } from './policy_list';
import { PolicyDetail } from './policy_detail';
import { PolicyCreateFlyout } from './policy_create_flyout';
import { selectShowCreate } from '../selectors/policy_list';
import { userClickedPolicyCreate } from '../actions/policy_list';

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

const CreatePolicyButton = React.memo<{ isDisabled?: boolean }>(({ isDisabled }) => {
  const dispatch = useDispatch();
  const handleButtonClick = () => {
    dispatch(userClickedPolicyCreate({ showCreate: true }));
  };
  return (
    <EuiButton onClick={handleButtonClick} isDisabled={isDisabled}>
      Create Policy
    </EuiButton>
  );
});

const ListView = withRouter(
  React.memo(() => {
    const showCreate = useSelector(selectShowCreate);
    return (
      <PageView title="Endpoint Security Policies">
        <>
          {showCreate && <PolicyCreateFlyout />}
          <CreatePolicyButton isDisabled={showCreate} />
          <PolicyList />
        </>
      </PageView>
    );
  })
);

const DetailView = React.memo(() => {
  return (
    <PageView title="Policy: Name here">
      <PolicyDetail />
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
      </EuiPageContent>
    </EuiPageBody>
  );
});
