/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { EXCEPTION_LIST_NAMESPACE_AGNOSTIC } from '../../../lists/common';

export const eventsIndexPattern = 'logs-endpoint.events.*';
export const alertsIndexPattern = 'logs-endpoint.alerts-*';
export const metadataIndexPattern = 'metrics-endpoint.metadata-*';
export const metadataCurrentIndexPattern = 'metrics-endpoint.metadata_current_*';
export const metadataTransformPrefix = 'endpoint.metadata_current-default';
export const policyIndexPattern = 'metrics-endpoint.policy-*';
export const telemetryIndexPattern = 'metrics-endpoint.telemetry-*';
export const LIMITED_CONCURRENCY_ENDPOINT_ROUTE_TAG = 'endpoint:limited-concurrency';
export const LIMITED_CONCURRENCY_ENDPOINT_COUNT = 100;

export const TRUSTED_APPS_INDEX_PATTERN = '.kibana';
export const TRUSTED_APPS_INDEX_NAMESPACE = EXCEPTION_LIST_NAMESPACE_AGNOSTIC;
export const TRUSTED_APPS_INDEX_FILTER_FIELDS = Object.freeze([
  `${TRUSTED_APPS_INDEX_NAMESPACE}.created_at`,
  `${TRUSTED_APPS_INDEX_NAMESPACE}.created_by`,
  `${TRUSTED_APPS_INDEX_NAMESPACE}.updated_on`,
  `${TRUSTED_APPS_INDEX_NAMESPACE}.updated_by`,
  `${TRUSTED_APPS_INDEX_NAMESPACE}.description`,
  `${TRUSTED_APPS_INDEX_NAMESPACE}.entries.field`,
  `${TRUSTED_APPS_INDEX_NAMESPACE}.entries.operator`,
  `${TRUSTED_APPS_INDEX_NAMESPACE}.entries.value`,
  `${TRUSTED_APPS_INDEX_NAMESPACE}.name`,
  `${TRUSTED_APPS_INDEX_NAMESPACE}.os_types`,
]);

export const TRUSTED_APPS_GET_API = '/api/endpoint/trusted_apps/{id}';
export const TRUSTED_APPS_LIST_API = '/api/endpoint/trusted_apps';
export const TRUSTED_APPS_CREATE_API = '/api/endpoint/trusted_apps';
export const TRUSTED_APPS_UPDATE_API = '/api/endpoint/trusted_apps/{id}';
export const TRUSTED_APPS_DELETE_API = '/api/endpoint/trusted_apps/{id}';
export const TRUSTED_APPS_SUMMARY_API = '/api/endpoint/trusted_apps/summary';

export const BASE_POLICY_RESPONSE_ROUTE = `/api/endpoint/policy_response`;
export const BASE_POLICY_ROUTE = `/api/endpoint/policy`;
export const AGENT_POLICY_SUMMARY_ROUTE = `${BASE_POLICY_ROUTE}/summaries`;
