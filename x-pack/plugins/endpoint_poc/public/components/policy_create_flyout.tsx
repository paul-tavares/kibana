/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import React, { useCallback, useEffect } from 'react';
import {
  EuiFlyout,
  EuiFlyoutHeader,
  EuiTitle,
  EuiFlyoutBody,
  EuiFlyoutFooter,
  EuiFlexGroup,
  EuiFlexItem,
  EuiButtonEmpty,
  EuiButton,
} from '@elastic/eui';
import { useDispatch } from 'react-redux';
import { userExitedPolicyCreate } from '../actions/policy_list';

export const PolicyCreateFlyout = React.memo(() => {
  const dispatch = useDispatch();
  const exitPolicyFloyout = useCallback(() => {
    dispatch(userExitedPolicyCreate({ showCreate: false }));
  }, [dispatch]);
  const onClose = () => {
    exitPolicyFloyout();
  };

  // When this component unmounts, ensure we reset State
  useEffect(() => exitPolicyFloyout, [exitPolicyFloyout]);

  return (
    <EuiFlyout onClose={onClose} size="m">
      <EuiFlyoutHeader hasBorder aria-labelledby="FleetCreatePolicyFlyoutTitle">
        <EuiTitle size="m">
          <h2>Create New Security Policy</h2>
        </EuiTitle>
      </EuiFlyoutHeader>

      <EuiFlyoutBody>FORM GOES HERE...</EuiFlyoutBody>

      <EuiFlyoutFooter>
        <EuiFlexGroup justifyContent="spaceBetween">
          <EuiFlexItem grow={false}>
            <EuiButtonEmpty iconType="cross" onClick={onClose} flush="left">
              Cancel
            </EuiButtonEmpty>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton
              fill
              isLoading={false}
              onClick={async () => {
                // setIsLoading(true);
                // try {
                //   const { success, error } = await libs.policies.create(policy);
                //   if (success) {
                //     libs.framework.notifications.addSuccess(
                //       i18n.translate('xpack.fleet.createPolicy.successNotificationTitle', {
                //         defaultMessage: "Policy '{name}' created",
                //         values: { name: policy.name },
                //       })
                //     );
                //   } else {
                //     libs.framework.notifications.addDanger(
                //       error
                //         ? error.message
                //         : i18n.translate('xpack.fleet.createPolicy.errorNotificationTitle', {
                //           defaultMessage: 'Unable to create policy',
                //         })
                //     );
                //   }
                // } catch (e) {
                //   libs.framework.notifications.addDanger(
                //     i18n.translate('xpack.fleet.createPolicy.errorNotificationTitle', {
                //       defaultMessage: 'Unable to create policy',
                //     })
                //   );
                // }
                // setIsLoading(false);
                // onClose();
              }}
            >
              Create
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlyoutFooter>
    </EuiFlyout>
  );
});
