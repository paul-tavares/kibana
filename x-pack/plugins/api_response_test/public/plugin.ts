/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { Plugin, CoreSetup } from 'kibana/public';

export class ApiResponseTestApp
  implements Plugin<ApiResponseTestAppSetup, ApiResponseTestAppStart> {
  public setup(core: CoreSetup, deps: {}) {
    core.application.register({
      id: 'api_response_test',
      title: 'API Response',
      async mount(context, params) {
        const { renderApp } = await import('./application');
        return renderApp(context, params);
      },
    });
  }

  public start() {}
  public stop() {}
}

export type ApiResponseTestAppSetup = ReturnType<ApiResponseTestApp['setup']>;
export type ApiResponseTestAppStart = ReturnType<ApiResponseTestApp['start']>;
