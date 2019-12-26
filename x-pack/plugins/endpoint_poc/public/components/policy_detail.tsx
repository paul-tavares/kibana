/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { ChangeEvent, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  EuiAccordion,
  EuiBadge,
  EuiCallOut,
  EuiLoadingContent,
  EuiPanel,
  EuiSpacer,
  EuiSwitch,
  EuiText,
  EuiFieldText,
  EuiButtonEmpty,
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
} from '@elastic/eui';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import {
  selectIsEndpointPolicy,
  selectIsFetching,
  selectItem,
  selectWasFetched,
  selectWasFound,
  selectWasUpdated,
} from '../selectors/policy_details';
import {
  fetchPolicyDetailsData,
  userClickedPolicyUpdateButton,
  userExitedPolicyDetails,
  userUpdatedPolicyDetailsData,
} from '../actions/policy_details';

const Loading = () => (
  <div>
    <EuiLoadingContent lines={5} />
  </div>
);

interface ISecurityRule {
  protect_notify_user: boolean;
  rule_id: string;
  rule_is_prevention: boolean;
  rule_name: string;
  rule_os_list: string[];
  rule_status: 'enabled' | 'disabled';
  rule_version: string;
}

const RuleProtection = React.memo<Partial<ISecurityRule>>(
  ({ rule_status, rule_name, rule_id, rule_os_list }) => {
    /* eslint-disable @typescript-eslint/camelcase */
    const handleEnableOnChange = () => {};

    const accordionButtonContent = (
      <>
        <div>{rule_name}</div>
        {Array.isArray(rule_os_list)
          ? rule_os_list.map(osName => <EuiBadge key={osName}>{osName}</EuiBadge>)
          : ''}
      </>
    );

    const enableDisableSwitch = (
      <EuiSwitch
        label="Enabled"
        checked={rule_status === 'enabled'}
        onChange={handleEnableOnChange}
      />
    );

    return (
      <>
        <EuiAccordion
          id={rule_id!}
          buttonContent={accordionButtonContent}
          paddingSize="xl"
          extraAction={enableDisableSwitch}
        />
        <EuiSpacer size="m" />
      </>
    );
  }
);

const ConnectedCancelButton = withRouter(({ history }: RouteComponentProps) => {
  return (
    <EuiButtonEmpty iconType="cross" onClick={() => history.push('/policies')} flush="left">
      Cancel
    </EuiButtonEmpty>
  );
});

export const PolicyDetail = React.memo<{
  policyId: string;
}>(({ policyId }) => {
  const dispatch = useDispatch();
  const item = useSelector(selectItem);
  const isEndpointPolicy = useSelector(selectIsEndpointPolicy);
  const wasFetched = useSelector(selectWasFetched);
  const wasFound = useSelector(selectWasFound);
  const isFetching = useSelector(selectIsFetching);
  const wasUpdated = useSelector(selectWasUpdated);
  const rules = getFakeRuleList();
  const handlePolicyNameChange = ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
    dispatch(userUpdatedPolicyDetailsData({ name: value }));
  };
  const handleUpdateButtonOnClick = () => {
    const { id, ...updatedItem } = item;
    dispatch(
      userClickedPolicyUpdateButton({
        id,
        item: updatedItem,
      })
    );
  };

  useEffect(() => {
    dispatch(fetchPolicyDetailsData({ policyId }));
  }, [dispatch, policyId]);

  useEffect(() => {
    return () => {
      dispatch(userExitedPolicyDetails());
    };
  }, [dispatch]);

  if (!item && !wasFetched) {
    return <Loading />;
  }

  if (wasFetched && (!isEndpointPolicy || !wasFound)) {
    return (
      <EuiCallOut title="Invalid Policy!" color="warning" iconType="help">
        <p>
          The item you are attempting view is not a valid Endpoint Security policy (Policy Id:{' '}
          <em>{policyId}</em>
          {!isEndpointPolicy && item ? <>, Package: {item.package.name}</> : ''})
        </p>
      </EuiCallOut>
    );
  }

  return (
    <>
      <EuiPanel>
        <EuiFieldText onChange={handlePolicyNameChange} value={item!.name} required fullWidth />
      </EuiPanel>

      <EuiSpacer size="l" />

      <EuiPanel paddingSize="l">
        <EuiText>
          <h3>Rules</h3>
        </EuiText>
        {rules.map(rule => (
          <RuleProtection key={rule.rule_id} {...rule} />
        ))}
      </EuiPanel>

      <EuiSpacer size="l" />

      <EuiPanel>
        <EuiFlexGroup justifyContent="spaceBetween">
          <EuiFlexItem grow={false}>
            <ConnectedCancelButton />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton
              fill
              isLoading={isFetching}
              isDisabled={isFetching || !wasUpdated}
              onClick={handleUpdateButtonOnClick}
            >
              Update
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiPanel>
    </>
  );
});

function getFakeRuleList(): ISecurityRule[] {
  return [
    {
      protect_notify_user: false,
      rule_id: '2b71ee09-5c6c-4ab2-93a9-230fc178c042',
      rule_is_prevention: true,
      rule_name: 'Persistence via Kernel Module Modification',
      rule_os_list: ['linux'],
      rule_status: 'disabled',
      rule_version: '1.2.44',
    },
    {
      protect_notify_user: false,
      rule_id: '2bb7ef4c-3c7a-4711-8026-a75821c63ce3',
      rule_is_prevention: true,
      rule_name: 'Enumeration Command Sequences',
      rule_os_list: ['linux'],
      rule_status: 'enabled',
      rule_version: '1.2.44',
    },
    {
      protect_notify_user: false,
      rule_id: '442a33d9-e068-41be-a1ce-521edfa5719a',
      rule_is_prevention: false,
      rule_name: 'Python Webshell',
      rule_os_list: ['linux', 'macos'],
      rule_status: 'enabled',
      rule_version: '1.2.0',
    },
    {
      protect_notify_user: false,
      rule_id: '4c7739d5-4072-4789-9dfe-5090d5c0731e',
      rule_is_prevention: true,
      rule_name: 'Sensitive Data Compressed for Exfil',
      rule_os_list: ['linux'],
      rule_status: 'enabled',
      rule_version: '1.2.44',
    },
    {
      protect_notify_user: false,
      rule_id: '53b5986a-d130-4c13-b010-aae4c110b71f',
      rule_is_prevention: true,
      rule_name: 'Privilege Escalation via SUID or Exploit',
      rule_os_list: ['linux'],
      rule_status: 'enabled',
      rule_version: '1.2.44',
    },
    {
      protect_notify_user: false,
      rule_id: '64fc9a4c-4032-4ec2-bf2e-fa4d4545f923',
      rule_is_prevention: true,
      rule_name: 'Compression of Sensitive Files',
      rule_os_list: ['linux'],
      rule_status: 'enabled',
      rule_version: '1.2.44',
    },
    {
      protect_notify_user: false,
      rule_id: '6faf22bd-3272-45b7-b33c-9fce13d0f72a',
      rule_is_prevention: false,
      rule_name: 'Cron Persistence from Executable File',
      rule_os_list: ['linux'],
      rule_status: 'disabled',
      rule_version: '1.2.0',
    },
    {
      protect_notify_user: false,
      rule_id: '7824e09a-49b5-44eb-a107-1b3fe156d254',
      rule_is_prevention: true,
      rule_name: 'Webshell',
      rule_os_list: ['linux'],
      rule_status: 'enabled',
      rule_version: '1.2.44',
    },
    {
      protect_notify_user: false,
      rule_id: '91cc6cd9-1376-4557-821e-b06a88e4b8f3',
      rule_is_prevention: true,
      rule_name: 'Suspicious File Reads',
      rule_os_list: ['linux'],
      rule_status: 'enabled',
      rule_version: '1.2.44',
    },
    {
      protect_notify_user: false,
      rule_id: '9f33e2e6-202a-4a64-a8fb-347434301b96',
      rule_is_prevention: true,
      rule_name: 'Cron Persistence from Executable File',
      rule_os_list: ['linux'],
      rule_status: 'enabled',
      rule_version: '1.2.44',
    },
    {
      protect_notify_user: false,
      rule_id: 'cd6db17e-ca81-4b5b-a6f2-a5e6ec1c439b',
      rule_is_prevention: true,
      rule_name: 'Suspicious File Access Attempts',
      rule_os_list: ['linux'],
      rule_status: 'enabled',
      rule_version: '1.2.44',
    },
  ];
}
