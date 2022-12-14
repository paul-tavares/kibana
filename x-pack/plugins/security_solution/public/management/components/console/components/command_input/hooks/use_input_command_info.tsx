/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { type ReactNode, useMemo } from 'react';
import { parseCommandInput } from '../../../service/parsed_command_input';
import { useWithInputCommandEntered } from '../../../hooks/state_selectors/use_with_input_command_entered';
import { useWithCommandList } from '../../../hooks/state_selectors/use_with_command_list';
import type { CommandDefinition } from '../../..';
import { useWithInputTextEntered } from '../../../hooks/state_selectors/use_with_input_text_entered';

interface ParsedDisplayInput {
  leftOfCursor: ReactNode;
  rightOfCursor: ReactNode;
}

export const useParsedDisplayInput = (): ParsedDisplayInput => {
  const { textEntered: leftOfCursor, rightOfCursor, fullTextEntered } = useWithInputTextEntered();
  const commandEntered = useWithInputCommandEntered();
  const commandList = useWithCommandList();

  const parsedInput = useMemo(() => {
    return parseCommandInput(fullTextEntered);
  }, [fullTextEntered]);

  const commandDefinition = useMemo<CommandDefinition | undefined>(() => {
    if (commandEntered) {
      return commandList.find((commandDef) => commandDef.name === commandEntered);
    }
  }, [commandEntered, commandList]);

  const { hasArgSelectors, argSelectors } = useMemo((): {
    hasArgSelectors: boolean;
    argSelectors: Required<CommandDefinition>['args'];
  } => {
    const valueSelectors: {
      hasArgSelectors: boolean;
      argSelectors: Required<CommandDefinition>['args'];
    } = {
      hasArgSelectors: false,
      argSelectors: {},
    };

    if (commandDefinition) {
      for (const [argName, argDef] of Object.entries(commandDefinition.args ?? {})) {
        if (argDef.SelectorComponent) {
          valueSelectors.hasArgSelectors = true;
          valueSelectors.argSelectors[argName] = argDef;
        }
      }
    }

    return valueSelectors;
  }, [commandDefinition]);

  return useMemo<ParsedDisplayInput>(() => {
    const response: ParsedDisplayInput = {
      leftOfCursor,
      rightOfCursor: rightOfCursor.text,
    };

    if (hasArgSelectors && parsedInput.hasArgs) {
      const inputPieces: ReactNode[] = fullTextEntered.split('');
      const suppressFromDisplay = Symbol('suppressed');

      for (const [argName, argDef] of Object.entries(argSelectors)) {
        const { SelectorComponent } = argDef;

        if (parsedInput.hasArg(argName)) {
          const pos = fullTextEntered.indexOf(`--${argName}`);
          const argChrLength = argName.length + 2;
          const replaceValues: Array<symbol | ReactNode> = Array.from(
            { length: argChrLength },
            () => suppressFromDisplay
          );
          replaceValues[0] = <SelectorComponent />;

          inputPieces.splice(pos, argChrLength, ...replaceValues);
        }
      }

      response.leftOfCursor = inputPieces.filter((piece) => piece !== suppressFromDisplay);
      response.rightOfCursor = ''; // FIXME:PT
    }

    return response;
  }, [argSelectors, fullTextEntered, hasArgSelectors, leftOfCursor, parsedInput, rightOfCursor]);
};
