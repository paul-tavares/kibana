/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { EuiCallOut, EuiLoadingContent } from '@elastic/eui';
import {
  selectIsEndpointPolicy,
  selectItem,
  selectWasFetched,
  selectWasFound,
} from '../selectors/policy_details';
import { fetchPolicyDetailsData, userExitedPolicyDetails } from '../actions/policy_details';

export const PolicyDetail = React.memo<{
  policyId: string;
}>(({ policyId }) => {
  const dispatch = useDispatch();
  const item = useSelector(selectItem);
  const isEndpointPolicy = useSelector(selectIsEndpointPolicy);
  const wasFetched = useSelector(selectWasFetched);
  const wasFound = useSelector(selectWasFound);

  useEffect(() => {
    dispatch(fetchPolicyDetailsData({ policyId }));
  }, [dispatch, policyId]);

  useEffect(() => {
    return () => {
      dispatch(userExitedPolicyDetails());
    };
  }, [dispatch]);

  if (!item && !wasFetched) {
    return (
      <div>
        <EuiLoadingContent lines={5} />
      </div>
    );
  }

  if (wasFetched && (!isEndpointPolicy || !wasFound)) {
    return (
      <EuiCallOut title="Invalid Policy!" color="warning" iconType="help">
        <p>
          The item you are attempting view is not a valid Endpoint Security policy (Policy Id:{' '}
          <em>{policyId}</em>)
        </p>
      </EuiCallOut>
    );
  }

  return <h1>TODO: Details here for: {policyId}</h1>;
});
