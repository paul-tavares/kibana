/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { ComponentType, FC, LazyExoticComponent } from 'react';
import { PackagePolicy } from './models';

// Copy of the type defind for the `React.lazy` function. Copied it here because I need
// to reuse the generic nature of it to drive specific interfaces needed on some components
// used in the extension points.
type LazyReactComponent<T extends ComponentType<any>> = (
  factory: () => Promise<{ default: T }>
) => LazyExoticComponent<T>;

export type IntegrationPolicyEditExtensionComponent = LazyReactComponent<
  FC<{
    integrationPolicy: PackagePolicy;
    onChange: (opts: { isValid: boolean; integrationPolicy: PackagePolicy }) => void;
  }>
>;

interface ExtensionPoint {
  type: 'integration-policy';
  view: 'edit';
  component: IntegrationPolicyEditExtensionComponent;
}

export type ExtensionRegistrationCallback = (extensionPoint: ExtensionPoint) => void;
