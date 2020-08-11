/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { SavedObjectsType } from 'kibana/server';

export const TRUSTED_APPS_SAVED_OBJECT_TYPE = 'trusted-apps';

export const trustedAppsType: SavedObjectsType = {
  hidden: false,
  mappings: {
    properties: {
      created_at: {
        type: 'keyword',
      },
      created_by: {
        type: 'keyword',
      },
      description: {
        type: 'keyword',
      },
      entries: {
        properties: {
          entries: {
            properties: {
              field: {
                type: 'keyword',
              },
              operator: {
                type: 'keyword',
              },
              type: {
                type: 'keyword',
              },
              value: {
                fields: {
                  text: {
                    type: 'text',
                  },
                },
                type: 'keyword',
              },
            },
          },
          field: {
            type: 'keyword',
          },
          list: {
            properties: {
              id: {
                type: 'keyword',
              },
              type: {
                type: 'keyword',
              },
            },
          },
          operator: {
            type: 'keyword',
          },
          type: {
            type: 'keyword',
          },
          value: {
            fields: {
              text: {
                type: 'text',
              },
            },
            type: 'keyword',
          },
        },
      },
      name: {
        type: 'keyword',
      },
      type: {
        type: 'keyword',
      },
      updated_by: {
        type: 'keyword',
      },
      version: {
        type: 'keyword',
      },
    },
  },
  name: TRUSTED_APPS_SAVED_OBJECT_TYPE,
  namespaceType: 'agnostic',
};
