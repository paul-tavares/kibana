/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { RequestHandler } from '@kbn/core/server';
import { schema } from '@kbn/config-schema';
import type stream from 'stream';
import { createNewFile } from '../../services/actions/action_files';
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
    const esClient = (await context.core).elasticsearch.client.asInternalUser;
    const fileStream = req.body as stream.Readable;

    const file = await createNewFile(esClient, logger);
    await file.uploadContent(fileStream);

    return res.ok({
      body: {
        message: `File with id [${file.id}] was created successfully`,
        data: file.toJSON(),
      },
    });
  };
};
