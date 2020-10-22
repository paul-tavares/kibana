/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { useContext } from 'react';

export const ExtensionsContext = React.createContext({});

export const useExtension = (name: string) => {
  const extensions = useContext(ExtensionsContext);
  return extensions && extensions[name];
};

export const createExtensionRegistrationCallback = (storage: {}) => {
  return () => {};
};
