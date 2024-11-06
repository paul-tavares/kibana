/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { RequestHandler } from '@kbn/core/server';
import { schema } from '@kbn/config-schema';
import AdmZip from 'adm-zip';
import { errorHandler } from '../error_handler';
import { stringify } from '../../utils/stringify';
import { getFileDownloadId } from '../../../../common/endpoint/service/response_actions/get_file_download_id';
import {
  getActionDetailsById,
  getResponseActionsClient,
  NormalizedExternalConnectorClient,
  type ResponseActionsClient,
} from '../../services';
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
        validate: {
          request: {
            query: schema.object({
              actionId: schema.string(),
            }),
          },
        },
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
    logger.debug(`retrieving file browser data: ${stringify(req.query)}`);

    try {
      const actionId = req.query.actionId;
      const coreContext = await context.core;
      const esClient = endpointContext.service.getInternalEsClient();
      const metadataClient = endpointContext.service.getEndpointMetadataService();
      const user = coreContext.security.authc.getCurrentUser();
      const casesClient = await endpointContext.service.getCasesClient(req);
      const connectorActions = (await context.actions).getActionsClient();
      const responseActionsClient: ResponseActionsClient = getResponseActionsClient('endpoint', {
        esClient,
        casesClient,
        endpointService: endpointContext.service,
        username: user?.username || 'unknown',
        connectorActions: new NormalizedExternalConnectorClient(connectorActions, logger),
      });

      // get action and ensure it is complete. if not, return 204
      const actionDetails = await getActionDetailsById(esClient, metadataClient, actionId);

      if (!actionDetails.isCompleted) {
        return res.notFound();
      }

      // Retrieve action file and write it to tmp folder
      const { stream } = await responseActionsClient.getFileDownload(
        actionId,
        getFileDownloadId(actionDetails, actionDetails.agents[0])
      );
      const fileBuffer = await readStreamToBuffer(stream);

      const zipFile = new AdmZip(fileBuffer, {});
      const stdoutContent = zipFile.getEntry('stdout').getData('elastic').toString('utf-8');

      logger.debug(`Content of stdout file in zip file: \n${stdoutContent}`);

      const stdOutJson = JSON.parse(stdoutContent);

      return res.ok({
        body: {
          data: {
            actionId: 'some action',
            contents: stdOutJson,
          },
        },
      });
    } catch (e) {
      return errorHandler(logger, res, e);
    }
  };
};

function readStreamToBuffer(readableStream) {
  return new Promise((resolve, reject) => {
    const chunks = [];

    readableStream.on('data', (chunk) => {
      chunks.push(chunk);
    });

    readableStream.on('end', () => {
      const buffer = Buffer.concat(chunks);
      resolve(buffer);
    });

    readableStream.on('error', (err) => {
      reject(err);
    });
  });
}
