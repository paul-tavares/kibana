/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { AppMountContext, HttpHandler } from 'kibana/public';

let kibanaAppContext: AppMountContext;

type THttpHandlerHook = [HttpHandler];

// This would likely be better if stored in redux - right?
export const storeAppMountContext = (context: AppMountContext) => (kibanaAppContext = context);

export const useAppMountContext = () => {
  return [kibanaAppContext];
};

export const useHttpGet = (): THttpHandlerHook => {
  return [kibanaAppContext.core.http.get];
};

export const useHttpPut = (): THttpHandlerHook => {
  return [kibanaAppContext.core.http.put];
};

export const useHttpPost = (): THttpHandlerHook => {
  return [kibanaAppContext.core.http.post];
};

export const useHttpDelete = (): THttpHandlerHook => {
  return [kibanaAppContext.core.http.delete];
};
