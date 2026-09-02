/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { EsqlEsqlResult } from '@elastic/elasticsearch/api/types';
import { set } from '@kbn/safer-lodash-set';

// FIXME:PT move to a more reusable location

/**
 * Generic utility to map ESQL result rows to objects
 * @param param0
 * @param param0.columns
 * @param param0.values
 */
export const mapEsQlResultTopObjects = <T extends {} | unknown = unknown>({
  columns,
  values,
}: EsqlEsqlResult): T[] => {
  return values.map((row) => {
    return row.reduce((acc, columnValue, index) => {
      set(acc, columns[index].name, columnValue);
      return acc;
    }, {});
  }) as T[];
};
