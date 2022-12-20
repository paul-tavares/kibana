/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { memo } from 'react';
import type { ActionRequestComponentProps } from '../types';

export const ExecuteFileAction = memo<
  ActionRequestComponentProps<{
    file: File;
  }>
>((props) => {
  const file = props.command.args.args.file[0];

  return (
    <div>
      <div>{`ExecuteFileAction todo`}</div>
      <div>
        <strong>{`Will be downloading file: ${file.name}`}</strong>
      </div>
    </div>
  );
});
ExecuteFileAction.displayName = 'ExecuteFileAction';
