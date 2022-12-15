/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { memo } from 'react';
import type { CommandArgDefinition } from '../../../types';

type ArgDefinitionWithRequiredSelector = Omit<CommandArgDefinition, 'SelectorComponent'> &
  Pick<Required<CommandArgDefinition>, 'SelectorComponent'>;

export interface ArgumentSelectorProps {
  argName: string;
  argDefinition: ArgDefinitionWithRequiredSelector;
}

/**
 * handles displaying a custom argument value selector.
 */
export const ArgumentSelector = memo<ArgumentSelectorProps>(
  ({ argName, argDefinition: { SelectorComponent } }) => {
    return (
      <span>
        {`--${argName}=`}
        <SelectorComponent />
      </span>
    );
  }
);
ArgumentSelector.displayName = 'ArgumentSelector';
