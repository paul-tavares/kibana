/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import type { IHttpFetchError } from '@kbn/core-http-browser';
import { useHttp } from '../../../../../common/lib/kibana';
import { ACTION_FILE_BROWSER_ROUTE } from '../../../../../../common/endpoint/constants';
import type { ActionDetailsApiResponse } from '../../../../../../common/endpoint/types';

export const useFetchDirectoryContent = (
  actionId: string,
  options: UseQueryOptions<{}, IHttpFetchError> = {}
): UseQueryResult<{}, IHttpFetchError> => {
  const http = useHttp();

  return useQuery<ActionDetailsApiResponse, IHttpFetchError>({
    queryKey: ['get-directory-content', actionId],
    ...options,
    queryFn: () => {
      return http.get(ACTION_FILE_BROWSER_ROUTE, {
        query: { actionId },
        version: 1,
      });
    },
  });
};
