/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { EsqlEsqlResult } from '@elastic/elasticsearch/lib/api/types';
import { set } from '@kbn/safer-lodash-set';
import { pick } from 'lodash';
import type { HostInfoInterface } from '../../../../common/endpoint/types';

interface EsQlHostMetadataResult {
  data: Pick<HostInfoInterface, 'metadata' | 'host_status' | 'last_checkin'>[];
  total: number;
}

export const mapEsQlResultToHostMetadataDocument = async (options: {
  queryResults: EsqlEsqlResult;
}): Promise<EsQlHostMetadataResult> => {
  const result: EsQlHostMetadataResult = {
    data: [],
    total: 0,
  };
  const { columns, values } = options.queryResults;

  result.total = values?.[0][columns.length - 1] ?? 0;

  result.data = values.map((hostValues) => {
    const hostMeta = hostValues.reduce((acc, hostColumnValue, index) => {
      set(acc, columns[index].name, hostColumnValue);
      return acc;
    }, {});

    return {
      metadata: pick(hostMeta, [
        '@timestamp',
        'event',
        'elastic',
        'Endpoint',
        'agent',
        'host',
        'data_stream',
      ]),
      last_checkin: hostMeta.fleet_agent.last_checkin,
      host_status: hostMeta.status,
    };
  });

  return result;
};
