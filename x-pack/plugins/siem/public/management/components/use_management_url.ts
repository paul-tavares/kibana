/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { useMemo } from 'react';
import { useKibana } from '../../common/lib/kibana';
import { getManagementUrl, GetManagementUrlProps } from '../common/routing';

export const useManagementUrl: (params: GetManagementUrlProps) => string = ({
  excludePrefix,
  ...params
}) => {
  const {
    services: {
      application: { getUrlForApp },
    },
  } = useKibana();
  const url = useMemo((): string => {
    return getUrlForApp('siem') + getManagementUrl(params);
  }, [getUrlForApp, getManagementUrl]);
  return url;
};
