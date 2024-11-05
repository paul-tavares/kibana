/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

export interface FilesystemItem {
  loaded: boolean;
  type: 'file' | 'directory';

  /** Defined when `loaded === true` */
  meta?: {
    name: string;
    fullPath: string;
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
  filesystem: FilesystemItem;
}
