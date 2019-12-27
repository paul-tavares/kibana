/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { useCallback } from 'react';
import { useHttpGet, useHttpPost } from '../concerns/kibana_app_context';
import { Policy } from '../../../legacy/plugins/ingest/server/libs/types';
import { ReturnTypeList } from '../../../legacy/plugins/ingest/common/types/std_return_format';

type TFleetPolicyList = ReturnTypeList<Policy>;

/**
 * React hook that will return a method to retrieve list of policies for a given datasource
 */
export const useFetchFleetPoliciesForDatasource = (): [
  (datasourceId: string) => Promise<TFleetPolicyList>
] => {
  const [httpGet] = useHttpGet();
  const fetchFleetPoliciesForDatasource = useCallback(
    (datasourceId: string) =>
      httpGet<TFleetPolicyList>(`/api/ingest/policies`, {
        query: {
          kuery: `policies.datasources: "${datasourceId}"`,
        },
      }),
    [httpGet]
  );
  return [fetchFleetPoliciesForDatasource];
};

/**
 * React hook that will return a method to retrieve list of policies for a given datasource
 */
export const useFetchFleetPoliciesOmittingDatasource = (): [
  (datasourceId: string) => Promise<TFleetPolicyList>
] => {
  const [httpGet] = useHttpGet();
  const fetchFleetPoliciesForDatasource = useCallback(
    (datasourceId: string) =>
      httpGet<TFleetPolicyList>(`/api/ingest/policies`, {
        query: {
          kuery: `not policies.datasources: "${datasourceId}"`,
        },
      }),
    [httpGet]
  );
  return [fetchFleetPoliciesForDatasource];
};

/**
 * Add datasource to a given Fleet policy
 */
export const useAddDatasourceToFleetPolicy = (): [
  (
    fleetPolicyId: string,
    datasourceId: string
  ) => Promise<{ item: { [key: string]: any }; success: boolean; action: string }>
] => {
  const [httpPost] = useHttpPost();
  const addDatasourceToFleetPolicy = useCallback(
    (fleetPolicyId: string, datasourceId: string) =>
      httpPost<TFleetPolicyList>(`/api/ingest/policies/${fleetPolicyId}/addDatasources`, {
        body: JSON.stringify({
          datasources: [datasourceId],
        }),
      }),
    [httpPost]
  );
  return [addDatasourceToFleetPolicy];
};

/**
 * Remove datasource to a given Fleet policy
 */
export const useARemoveDatasourceToFleetPolicy = (): [
  (
    fleetPolicyId: string,
    datasourceId: string
  ) => Promise<{ item: { [key: string]: any }; success: boolean; action: string }>
] => {
  const [httpPost] = useHttpPost();
  const addDatasourceToFleetPolicy = useCallback(
    (fleetPolicyId: string, datasourceId: string) =>
      httpPost<TFleetPolicyList>(`/api/ingest/policies/${fleetPolicyId}/removeDatasources`, {
        body: JSON.stringify({
          datasources: [datasourceId],
        }),
      }),
    [httpPost]
  );
  return [addDatasourceToFleetPolicy];
};
