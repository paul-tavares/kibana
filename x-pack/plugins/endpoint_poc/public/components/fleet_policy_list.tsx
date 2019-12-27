/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import React, { useEffect, useState } from 'react';
import { EuiBasicTable } from '@elastic/eui';
import {
  useFetchFleetPoliciesOmittingDatasource,
  useFetchFleetPoliciesForDatasource,
} from '../hooks/fleet';

export interface IFleetPolicyListProps {
  datasourceId: string;
  isSelectable?: boolean;
  /**
   * When set to true, all policies NOT having the given Datasource will be returned
   */
  invert?: boolean;
  onSelect?: (selected) => void;
  disableSelection?: boolean;
}

const NOOP = () => {};
const columns = [
  {
    field: 'name',
    name: 'Name',
  },
];

/**
 * Display a list of Fleet Policies filtered by a given Datasource ID
 */
export const FleetPolicyList: React.FunctionComponent<IFleetPolicyListProps> = React.memo(
  ({
    datasourceId,
    isSelectable = false,
    invert = false,
    onSelect = NOOP,
    disableSelection = false,
  }) => {
    // For this component, I'll use hooks since there is no need to expose state globally or
    // share between components

    const [fleetPolicyItems, setFleetPolicyItems] = useState([]);
    const [lastFetchedDatasourceId, setLastFetchedDatasourceId] = useState('');
    const [isFetching, setIsFetching] = useState(false);
    const [fetchFleetPoliciesForDatasource] = useFetchFleetPoliciesForDatasource();
    const [fetchFleetPoliciesOmittingDatasource] = useFetchFleetPoliciesOmittingDatasource();
    const handleTableChange = () => {};

    useEffect(() => {
      if (lastFetchedDatasourceId !== datasourceId) {
        setIsFetching(true);
        setLastFetchedDatasourceId(datasourceId);
        (invert
          ? fetchFleetPoliciesOmittingDatasource(datasourceId)
          : fetchFleetPoliciesForDatasource(datasourceId)
        ).then(policies => {
          setFleetPolicyItems(policies.list);
          setIsFetching(false);
        });
      }
    }, [
      setIsFetching,
      fetchFleetPoliciesForDatasource,
      datasourceId,
      lastFetchedDatasourceId,
      invert,
      fetchFleetPoliciesOmittingDatasource,
    ]);

    return (
      <EuiBasicTable
        items={fleetPolicyItems}
        columns={columns}
        loading={isFetching}
        pagination={{
          pageIndex: 0,
          pageSize: 20,
          totalItemCount: 0,
          pageSizeOptions: [5, 10, 20],
          hidePerPageOptions: false,
        }}
        sorting={{
          sort: {
            field: 'name',
            direction: 'asc',
          },
        }}
        itemId="id"
        isSelectable={isSelectable}
        selection={
          isSelectable
            ? {
                selectable: () => !disableSelection,
                selectableMessage: () => 'select it',
                onSelectionChange: onSelect,
              }
            : null
        }
        onChange={handleTableChange}
      />
    );
  }
);
