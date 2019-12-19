/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { AppMountContext } from 'kibana/public';
import { withPageNavigationStatus } from './common';
import { hrefIsForPath } from '../concerns/routing';
import {
  IPolicyListServerResponse,
  isFetchingPolicyListData,
  serverReturnedPolicyCreateSuccess,
  serverReturnedPolicyListData,
  userClickedPolicyCreateButton,
} from '../actions/policy_list';
import { GlobalState } from '../types';

export const policyListSaga = async (
  { actionsAndState, dispatch }: { actionsAndState: any; dispatch: any },
  context: AppMountContext
) => {
  const httpGet = context.core.http.get;
  const httpPost = context.core.http.post;
  function isOnPage(href: any) {
    const isOnPageResponse: boolean = hrefIsForPath(
      href,
      `${context.core.http.basePath.get()}/app/endpoint_poc/policies`
    );
    return isOnPageResponse;
  }

  for await (const {
    action,
    userIsOnPageAndLoggedIn,
    // href,
    state,
    shouldInitialize,
  } of withPageNavigationStatus({
    actionsAndState,
    isOnPage,
  })) {
    if (userIsOnPageAndLoggedIn) {
      if (shouldInitialize || action.type === serverReturnedPolicyCreateSuccess.type) {
        dispatch(isFetchingPolicyListData({ isFetching: true }));
        try {
          // FIXME: need to have ability to filter datasources by something that identifies the ones for Endpoint
          const response = await httpGet<IPolicyListServerResponse>('/api/ingest/datasources');
          dispatch(serverReturnedPolicyListData(response));
        } catch (error) {
          // TODO: dispatch an error action
          throw new Error(error);
        }
      } else if (action.type === userClickedPolicyCreateButton.type) {
        try {
          const response = await httpPost('/api/ingest/datasources', {
            body: createFakeDataSourcePayloadJsonString(
              (state as GlobalState).policyList.createFormData.name
            ),
          });
          dispatch(serverReturnedPolicyCreateSuccess(response));
        } catch (error) {
          // FIXME: handle errors
          throw new Error(error);
        }
      }
    }
  }
};

function createFakeDataSourcePayloadJsonString(name = `endpoint ${Date.now()}`) {
  return JSON.stringify({
    datasource: {
      name,
      package: {
        name: 'endpoint',
        version: '1.0.1',
        description: 'Description about Endpoint package',
        title: 'Endpoint Security',
        assets: [
          {
            id: 'string',
            type: 'index-template',
          },
        ],
      },
      streams: [
        {
          id: 'string',
          input: {
            type: 'etc',
            config: {
              paths: '/var/log/*.log',
            },
            ingest_pipelines: ['string'],
            id: 'string',
            index_template: 'string',
            ilm_policy: 'string',
            fields: [{}],
          },
          config: {
            metricsets: ['container', 'cpu'],
          },
          output_id: 'default',
          processors: ['string'],
        },
      ],
      read_alias: 'string',
    },
  });
}
