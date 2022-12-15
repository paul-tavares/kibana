/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { memo, useCallback, useState } from 'react';
import { EuiFlexGroup, EuiFlexItem } from '@elastic/eui';
import type { CommandArgDefinition, CommandArgumentValueSelectorProps } from '../../../types';

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
    // FIXME:PT this should be persisted to store
    const [{ valueText, value }, setSelection] = useState<
      Parameters<CommandArgumentValueSelectorProps['onChange']>[0]
    >({
      value: undefined,
      valueText: '',
    });

    // FIXME:PT get `Command` from store

    const handleSelectorComponentOnChange = useCallback<
      CommandArgumentValueSelectorProps['onChange']
    >((updates) => {
      setSelection({ ...updates });
    }, []);

    // FIXME:PT wrapper component needs to have bounds on width and overflow
    return (
      <span className="eui-displayInlineBlock">
        <EuiFlexGroup responsive={false} gutterSize="none">
          <EuiFlexItem grow={false}>{`--${argName}=`}</EuiFlexItem>
          <EuiFlexItem grow={false}>
            <SelectorComponent
              value={value}
              valueText={valueText}
              onChange={handleSelectorComponentOnChange}
              command={{}}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
      </span>
    );
  }
);
ArgumentSelector.displayName = 'ArgumentSelector';
