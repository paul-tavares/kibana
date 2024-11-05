/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { RequestHandler } from '@kbn/core/server';
import type {
  SecuritySolutionPluginRouter,
  SecuritySolutionRequestHandlerContext,
} from '../../../types';
import type { EndpointAppContext } from '../../types';
import { ACTION_FILE_BROWSER_ROUTE } from '../../../../common/endpoint/constants';
import { withEndpointAuthz } from '../with_endpoint_authz';
import type { EndpointActionFileDownloadParams } from '../../../../common/api/endpoint';

export const registerFileBrowserRoutes = (
  router: SecuritySolutionPluginRouter,
  endpointContext: EndpointAppContext
): void => {
  const logger = endpointContext.logFactory.get('fileBrowserAction');

  router.versioned
    .get({
      access: 'internal',
      path: ACTION_FILE_BROWSER_ROUTE,
      options: { authRequired: true, tags: ['access:securitySolution'] },
    })
    .addVersion(
      {
        version: '1',
        // FIXME:PT implement schema validation
        validate: false,
      },
      withEndpointAuthz(
        { any: ['canWriteExecuteOperations'] },
        logger,
        getFileBrowserRouteHandler(endpointContext)
      )
    );
};

export const getFileBrowserRouteHandler = (
  endpointContext: EndpointAppContext
): RequestHandler<
  EndpointActionFileDownloadParams,
  unknown,
  unknown,
  SecuritySolutionRequestHandlerContext
> => {
  const logger = endpointContext.logFactory.get('actionFileBrowser');

  return async (context, req, res) => {
    return res.noContent({ body: 'still working on it' });
  };
};
