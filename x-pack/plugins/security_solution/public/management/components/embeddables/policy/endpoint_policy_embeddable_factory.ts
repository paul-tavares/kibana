/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { CoreSetup } from 'kibana/public';
import {
  EmbeddableFactoryDefinition,
  EmbeddableInput,
  IContainer,
} from '../../../../../../../../src/plugins/embeddable/public';
import { ENDPOINT_POLICY_EMBEDDABLE } from './constants';
import { PluginStart, StartPlugins } from '../../../../types';

export class EndpointPolicyEmbeddableFactoryDefinition implements EmbeddableFactoryDefinition {
  public readonly type = ENDPOINT_POLICY_EMBEDDABLE;

  constructor(private readonly coreSetup: CoreSetup<StartPlugins, PluginStart>) {}

  async isEditable() {
    return true;
  }

  async create(initialInput: EmbeddableInput, parent?: IContainer) {
    // IMPORTANT: lazy load the component's class
    const { EndpointPolicyEmbeddable } = await import('./endpoint_policy_embeddable');
    const [coreStart, startPlugins] = await this.coreSetup.getStartServices();

    return new EndpointPolicyEmbeddable(
      {
        coreStart,
        startPlugins,
      },
      initialInput,
      parent
    );
  }

  getDisplayName() {
    return 'Endpoint Policy'; // should be i18n
  }
}
