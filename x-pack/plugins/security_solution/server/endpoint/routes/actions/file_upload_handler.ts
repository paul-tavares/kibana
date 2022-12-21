/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { RequestHandler } from '@kbn/core/server';
import { schema } from '@kbn/config-schema';
import type {
  SecuritySolutionPluginRouter,
  SecuritySolutionRequestHandlerContext,
} from '../../../types';
import type { EndpointAppContext } from '../../types';
import { withEndpointAuthz } from '../with_endpoint_authz';

export const registerActionFileUploadRoutes = (
  router: SecuritySolutionPluginRouter,
  endpointContext: EndpointAppContext
) => {
  const logger = endpointContext.logFactory.get('actionFileUpload');

  router.post(
    {
      path: `/api/endpoint/action/upload`,
      options: {
        authRequired: true,
        tags: ['access:securitySolution'],
        // `body` setup here taken from Lists plugin
        // and also from: src/plugins/files/server/routes/file_kind/upload.ts:98
        body: {
          output: 'stream',
          maxBytes: 9000000,
          accepts: 'application/octet-stream',
          parse: false,
        },
      },
      validate: {
        body: schema.stream(),
      },
    },
    withEndpointAuthz(
      { all: ['canWriteFileOperations'] },
      logger,
      getActionFileUploadRouteHandler(endpointContext)
    )
  );
};

export const getActionFileUploadRouteHandler = (
  endpointContext: EndpointAppContext
): RequestHandler<undefined, unknown, unknown, SecuritySolutionRequestHandlerContext> => {
  const logger = endpointContext.logFactory.get('actionFileUpload');

  return async (context, req, res) => {
    // (request.body.file as HapiReadableStream)
    const fileStream = req.body as ReadableStream;

    return res.ok({
      body: {
        message: `api not yet operational`,
      },
    });
  };
};
