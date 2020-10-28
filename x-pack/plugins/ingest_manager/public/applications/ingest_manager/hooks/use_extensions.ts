/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { ComponentType, LazyExoticComponent, useContext } from 'react';
import {
  ExtensionPoint,
  ExtensionRegistrationCallback,
  ExtensionsStorage,
} from '../../../../common/types/extensions';
import { useStartDeps } from './use_deps';

export const ExtensionsContext = React.createContext<ExtensionsStorage>({});

// FIXME:PT Return value here needs to narrow down the type based on `type` ++ `view`
export const useExtension = (
  integration: ExtensionPoint['integration'],
  type: ExtensionPoint['type'],
  view: ExtensionPoint['view']
): LazyExoticComponent<ComponentType<any>> | undefined => {
  const extensions = useContext(ExtensionsContext);
  return extensions?.[integration]?.[type]?.[view];
};

export const useEmbeddable = (embeddableId: string) => {
  const { embeddable } = useStartDeps();
  return embeddable.getEmbeddableFactory(embeddableId);
};

export const createExtensionRegistrationCallback = (
  storage: ExtensionsStorage
): ExtensionRegistrationCallback => {
  return (extensionPoint) => {
    if (!storage[extensionPoint.integration]) {
      storage[extensionPoint.integration] = {};
    }
    if (storage[extensionPoint.integration][extensionPoint.type]?.[extensionPoint.view]) {
      throw new Error(
        `Extension point has already been registered: [${extensionPoint.integration}][${extensionPoint.type}][${extensionPoint.view}]`
      );
    }
    if (!storage[extensionPoint.integration][extensionPoint.type]) {
      storage[extensionPoint.integration][extensionPoint.type] = {};
    }
    storage[extensionPoint.integration][extensionPoint.type][extensionPoint.view] =
      extensionPoint.component;
  };
};
