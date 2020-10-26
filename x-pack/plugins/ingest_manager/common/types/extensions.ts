/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { ComponentType, LazyExoticComponent } from 'react';
import { PackagePolicy } from './models';

// Copy of the type defind for the `React.lazy` function. Copied it here because I need
// to reuse the generic nature of it to drive specific interfaces needed on some components
// used in the extension points.
type LazyReactComponent<T extends ComponentType<any>> = (
  factory: () => Promise<{ default: T }>
) => LazyExoticComponent<T>;

export type IntegrationPolicyEditExtensionComponent = ComponentType<{
  integrationPolicy: PackagePolicy;
  onChange: (opts: { isValid: boolean; integrationPolicy: PackagePolicy }) => void;
}>;

export type ExtensionPoint =
  | {
      integration: string;
      type: 'integration-policy';
      view: 'edit';
      component: LazyReactComponent<IntegrationPolicyEditExtensionComponent>;
    }
  | {
      integration: string;
      type: 'integration';
      view: 'custom';
      component: LazyReactComponent<ComponentType<any>>;
    };

export type ExtensionRegistrationCallback = (extensionPoint: ExtensionPoint) => void;

// FIXME:PT this needs to be reworked into a correct typed up structure
export interface ExtensionsStorage {
  [key: string]: Partial<
    Record<
      ExtensionPoint['type'],
      Partial<Record<ExtensionPoint['view'], ExtensionPoint['component']>>
    >
  >;
}
