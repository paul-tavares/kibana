/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { memo, useEffect, useMemo, useState } from 'react';
import {
  SearchBar,
  TimeHistory,
  Query,
  IIndexPattern,
  IFieldType,
  SearchBarProps,
} from '../../../../../../../../../../src/plugins/data/public';
import { Storage } from '../../../../../../../../../../src/plugins/kibana_utils/public';
import { useKibana } from '../../../../../../common/lib/kibana';
import {
  TRUSTED_APPS_INDEX_FILTER_FIELDS,
  TRUSTED_APPS_INDEX_PATTERN,
} from '../../../../../../../common/endpoint/constants';

export type TrustedAppsSearchBarProps = Pick<SearchBarProps, 'onQuerySubmit'>;

export const TrustedAppsSearchBar = memo<TrustedAppsSearchBarProps>(({ onQuerySubmit }) => {
  const {
    services: { data },
  } = useKibana();
  const timeHistory = useMemo(() => new TimeHistory(new Storage(localStorage)), []);
  const decodedQuery: Query = { query: '', language: 'kuery' };

  const [patterns, setPatterns] = useState<IIndexPattern[]>([]);

  // NOT what I want.
  // This adds predefined "filters" to the search bar, visible
  // when the `showFilterBar` prop is true
  // ------------------
  // const suggestionFilters: Filter[] = useMemo(() => {
  //   return [
  //     {
  //       meta: { alias: 'hello', disabled: false, negate: false, index: '.kibana' },
  //       query: { match_phrase: { src: 'test' } },
  //     },
  //   ];
  // }, []);

  // Retrieve the fields for the Index pattern where trusted apps are stored
  useEffect(() => {
    (async () => {
      const fields: IFieldType[] = await data.indexPatterns.getFieldsForWildcard({
        pattern: TRUSTED_APPS_INDEX_PATTERN,
      });

      setPatterns([
        {
          title: TRUSTED_APPS_INDEX_PATTERN,
          fields: fields.filter((field) => TRUSTED_APPS_INDEX_FILTER_FIELDS.includes(field.name)),
        },
      ]);
    })();
  }, [data.indexPatterns]);

  return (
    <div>
      <SearchBar
        dataTestSubj="adminSearchBar"
        query={decodedQuery}
        indexPatterns={patterns}
        timeHistory={timeHistory}
        onQuerySubmit={onQuerySubmit}
        isLoading={patterns.length === 0}
        showFilterBar={false}
        showDatePicker={false}
        showQueryBar={true}
        showQueryInput={true}
      />
    </div>
  );
});
TrustedAppsSearchBar.displayName = 'TrustedAppsSearchBar';
