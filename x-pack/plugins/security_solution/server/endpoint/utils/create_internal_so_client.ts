/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import type { SavedObjectsServiceStart } from '@kbn/core-saved-objects-server';
import { SECURITY_EXTENSION_ID } from '@kbn/core-saved-objects-server';
import type { SavedObjectsClientContract, HttpServiceSetup } from '@kbn/core/server';
import { CoreKibanaRequest } from '@kbn/core/server';
import { DEFAULT_SPACE_ID } from '@kbn/spaces-plugin/common';
import { EndpointError } from '../../../common/endpoint/errors';

export const createInternalSoClient = (
  savedObjectsServiceStart: SavedObjectsServiceStart,
  /** Required if `spaceId` is used */
  httpServiceSetup?: HttpServiceSetup,
  spaceId: string = DEFAULT_SPACE_ID
): SavedObjectsClientContract => {
  const fakeRequest = CoreKibanaRequest.from({
    headers: {},
    path: '/',
    route: { settings: {} },
    url: { href: {}, hash: '' } as URL,
    raw: { req: { url: '/' } } as any,
  });

  if (spaceId && spaceId !== DEFAULT_SPACE_ID) {
    if (!httpServiceSetup) {
      throw new EndpointError(`'httpServiceSetup' is required when creating client for 'spaceId'`);
    }

    httpServiceSetup.basePath.set(fakeRequest, `/s/${spaceId}`);
  }

  const soClient = savedObjectsServiceStart.getScopedClient(fakeRequest, {
    excludedExtensions: [SECURITY_EXTENSION_ID],
  });

  // FYI: if needing access to all saved objects across all spaces, add `SPACES_EXTENSION_ID` to
  // list of `excludedExtentions` (from '@kbn/core-saved-objects-server')

  return soClient;
};
