/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { metadataIndexPattern } from '../../../../../common/endpoint/constants';

export const getEsQlFetchLatestLatestEndpointMetadataByAgentIds = (agentIds: string[]): string => {
  return `
  SET unmapped_fields = "LOAD";
  FROM ${metadataIndexPattern}
  | WHERE agent.id IN (${agentIds.map((id) => `"${id}"`).join(', ')})
  | INLINE STATS _max_ts = MAX(@timestamp) BY agent.id
  | WHERE @timestamp == _max_ts
  | DROP _max_ts
  | EVAL host.os.name = host.os.name
  | EVAL host.os.full = host.os.full
  | EVAL Endpoint.policy.applied.endpoint_policy_version = Endpoint.policy.applied.endpoint_policy_version
  | EVAL Endpoint.policy.applied.version = Endpoint.policy.applied.version
  | EVAL agent.build.original = agent.build.original
  | LIMIT ${agentIds.length}
  `;
};
