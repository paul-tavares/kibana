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
          // FIXME:PT `maxBytes` should be defined in the Plugin's config like other plugins do it
          maxBytes: 26214400, // 25MB payload limit
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

    // FIXME:PT remove this await. Only needed for POC.
    // Need this because there seems to be a delay in the file chunks being saved/propogated in ES,
    // which was causing the download link for the file uploaded to report DELETED
    await new Promise((r) => setTimeout(r, 2000));

    return res.ok({
      body: {
        message: `File with id [${file.id}] was created successfully`,
        data: file.toJSON(),
      },
    });
  };
};
