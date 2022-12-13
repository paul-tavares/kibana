/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { memo } from 'react';
import type { CommandArgumentValueSelectorProps } from '../console/types';

export const ArgumentFileSelector = memo<CommandArgumentValueSelectorProps>(
  ({ command, onChange }) => {
    return <div>{'FileSelector placeholder'}</div>;
  }
);
ArgumentFileSelector.displayName = 'ArgumentFileSelector';
