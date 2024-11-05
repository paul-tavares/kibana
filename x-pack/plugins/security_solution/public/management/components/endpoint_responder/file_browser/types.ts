/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { ResponseActionAgentType } from '../../../../../common/endpoint/service/response_actions/constants';

export interface FilesystemItem {
  loaded: boolean;
  type: 'file' | 'directory';
  fullPath: string;

  /** Defined when `loaded === true` */
  meta?: {
    name: string;
    size: number;
    modified: string;
  };

  /** Only defined for `type === directory` */
  contents?: FilesystemItem;

  /** Only present for `type === directory`. The action state that retrieved the directory's content */
  action?: {
    actionId: string;
    isPending: boolean;
    /** Date when the action completed that retrieved this data */
    retrieved: string;
  };
}

export interface FileBrowserState {
  agentId: string;
  agentType: ResponseActionAgentType;
  filesystem: FilesystemItem;
}
