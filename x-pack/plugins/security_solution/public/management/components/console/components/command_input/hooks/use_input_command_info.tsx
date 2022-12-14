/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { type ReactNode, useMemo } from 'react';
import type { CommandArgDefinition } from '../../../types';
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

  interface ArgsWithSelectorsMap {
    hasArgSelectors: boolean;
    argSelectors: Record<
      string,
      Omit<CommandArgDefinition, 'SelectorComponent'> &
        Pick<Required<CommandArgDefinition>, 'SelectorComponent'>
    >;
  }
  const { hasArgSelectors, argSelectors } = useMemo(() => {
    const valueSelectors: ArgsWithSelectorsMap = {
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
      const suppressFromDisplay = Symbol('suppressed');

      interface InputPieces {
        input: string;
        items: ReactNode[];
      }

      const leftOfCursorItems: InputPieces = {
        input: leftOfCursor,
        items: leftOfCursor.split(''),
      };
      const rightOfCursorItems: InputPieces = {
        input: rightOfCursor.text,
        items: rightOfCursor.text.split(''),
      };

      const inputPieces: InputPieces[] = [leftOfCursorItems, rightOfCursorItems];

      for (const [argName, argDef] of Object.entries(argSelectors)) {
        // Loop through the input pieces (left and right side of cursor) looking for the Argument name
        for (const { input, items } of inputPieces) {
          // TODO:PT Support multiple occurrences of the argument
          const argNameMatch = `--${argName}`;
          const pos = input.indexOf(argNameMatch);

          if (parsedInput.hasArg(argName) && pos !== -1) {
            const { SelectorComponent } = argDef;

            const argChrLength = argNameMatch.length;
            const replaceValues: Array<symbol | ReactNode> = Array.from(
              { length: argChrLength },
              () => suppressFromDisplay
            );

            replaceValues[0] = <SelectorComponent />;

            items.splice(pos, argChrLength, ...replaceValues);
          }
        }
      }

      response.leftOfCursor = leftOfCursorItems.items.filter(
        (piece) => piece !== suppressFromDisplay
      );
      response.rightOfCursor = rightOfCursorItems.items.filter(
        (piece) => piece !== suppressFromDisplay
      );
    }

    return response;
  }, [argSelectors, hasArgSelectors, leftOfCursor, parsedInput, rightOfCursor]);
};
