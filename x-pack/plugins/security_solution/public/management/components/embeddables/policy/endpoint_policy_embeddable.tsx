/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { CoreStart } from 'kibana/public';
import React, { ComponentType } from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import {
  Embeddable,
  EmbeddableInput,
  IContainer,
} from '../../../../../../../../src/plugins/embeddable/public';
import { ENDPOINT_POLICY_EMBEDDABLE } from './constants';
import { StartPlugins } from '../../../../types';
import { withSecurityContext } from '../../with_security_context';
import { EditEndpointPolicy } from '../../../pages/policy/view/ingest_manager_integration/edit_endpoint_policy';

interface EndpointPolicyEmbeddableStartServices {
  coreStart: CoreStart;
  startPlugins: StartPlugins;
}

export class EndpointPolicyEmbeddable extends Embeddable {
  // The type of this embeddable. This will be used to find the appropriate factory
  // to instantiate this kind of embeddable.
  public readonly type = ENDPOINT_POLICY_EMBEDDABLE;
  private _startServices: EndpointPolicyEmbeddableStartServices;
  private EditEndpointPolicyComponent: ComponentType<any>;
  private mountedNode: HTMLElement;

  constructor(
    startServices: EndpointPolicyEmbeddableStartServices,
    initialInput: EmbeddableInput,
    parent?: IContainer
  ) {
    super(
      // Input state is irrelevant to this embeddable, just pass it along.
      initialInput,
      // Initial output state - this embeddable does not do anything with output, so just
      // pass along an empty object.
      {},
      // Optional parent component, this embeddable can optionally be rendered inside a container.
      parent
    );

    this._startServices = startServices;
    this.EditEndpointPolicyComponent = withSecurityContext({
      coreStart: startServices.coreStart,
      depsStart: startServices.startPlugins,
      WrappedComponent: EditEndpointPolicy,
    });
  }

  /**
   * Render yourself at the dom node using whatever framework you like, angular, react, or just plain
   * vanilla js.
   * @param node
   */
  public render(node: HTMLElement) {
    this.mountedNode = node;

    render(<this.EditEndpointPolicyComponent />, node);
    // node.innerHTML = '<div style="font-size: 100px;">Look - its the endpoint policy</div>';
  }

  destroy() {
    unmountComponentAtNode(this.mountedNode);
    super.destroy();
  }

  /**
   * This is mostly relevant for time based embeddables which need to update data
   * even if EmbeddableInput has not changed at all.
   */
  public reload() {}
}
