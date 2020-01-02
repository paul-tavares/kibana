/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import React, { useState } from 'react';
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
import { FleetPolicyList } from './fleet_policy_list';
import { useAddDatasourceToFleetPolicy, useARemoveDatasourceFromFleetPolicy } from '../hooks/fleet';

const NOOP = () => {};

export const FleetPolicyAssignmentFlyout: React.FunctionComponent<{
  datasourceId: string;
  onClose: () => void;
  mode: 'assign' | 'un-assign';
  onSuccess?: () => void;
}> = React.memo(({ datasourceId, onClose, mode, onSuccess = NOOP }) => {
  const [selected, setSelected] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [addDatasourceToFleetPolicy] = useAddDatasourceToFleetPolicy();
  const [removeDatasourceFromFleetPolicy] = useARemoveDatasourceFromFleetPolicy();
  const isAssignMode = mode === 'assign';
  const assignUnAssignButtonTitle = isAssignMode ? 'Assign' : 'Un-Assign';
  const hasSelections = selected.length > 0;
  const handlePolicySelection = selection => setSelected(selection);
  const handleAssignmentButtonClick = () => {
    setIsUpdating(true);
    Promise.all(
      selected.map(policy =>
        isAssignMode
          ? addDatasourceToFleetPolicy(policy.id, datasourceId)
          : removeDatasourceFromFleetPolicy(policy.id, datasourceId)
      )
    ).then(() => {
      onSuccess();
    });
  };

  return (
    <EuiFlyout onClose={onClose} size="m">
      <EuiFlyoutHeader hasBorder>
        <EuiTitle size="m">
          <h2>{isAssignMode ? 'Assign to ' : 'Un-Assign from'} Fleet Policies</h2>
        </EuiTitle>
      </EuiFlyoutHeader>

      <EuiFlyoutBody>
        <FleetPolicyList
          datasourceId={datasourceId}
          invert={isAssignMode}
          isSelectable={true}
          onSelect={handlePolicySelection}
          disableSelection={isUpdating}
        />
      </EuiFlyoutBody>

      <EuiFlyoutFooter>
        <EuiFlexGroup justifyContent="spaceBetween">
          <EuiFlexItem grow={false}>
            <EuiButtonEmpty iconType="cross" onClick={onClose} flush="left">
              Close
            </EuiButtonEmpty>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton
              fill
              isLoading={isUpdating}
              isDisabled={isUpdating || !hasSelections}
              onClick={handleAssignmentButtonClick}
            >
              {assignUnAssignButtonTitle}
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlyoutFooter>
    </EuiFlyout>
  );
});
