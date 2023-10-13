/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { memo, useEffect, useState } from 'react';
import { useConsoleManager } from './components/console_manager';
import type { ConsoleRegistrationInterface } from './components/console_manager/types';

export type ConsoleViewProps<TMeta extends object = any> = Omit<
  ConsoleRegistrationInterface<TMeta>,
  'onHide'
> &
  // OnHide is required
  Pick<Required<ConsoleRegistrationInterface<TMeta>>, 'onHide'>;

/**
 * Displays the full console page view (full page overlay).
 *
 * Note that this component needs to be used inside `<ConsoleManager>` (a React Context.Provider component),
 * since state for it is managed by that component. `<ConsoleManager>` is already included globally
 * within Security Solution.
 */
export const ConsoleView = memo<ConsoleViewProps>((props) => {
  const consoleManager = useConsoleManager();
  const [runningConsole, setRunningConsole] = useState(consoleManager.getOne(props.id));

  useEffect(() => {
    if (!runningConsole) {
      setRunningConsole(consoleManager.register(props));
    }
  }, [consoleManager, props, runningConsole]);

  useEffect(() => {
    if (runningConsole && !runningConsole.isVisible()) {
      runningConsole.show();
    }

    return () => {
      if (runningConsole && runningConsole.isVisible()) {
        runningConsole.hide();
      }
    };
  }, [runningConsole]);

  return <></>;
});
ConsoleView.displayName = 'ConsoleView';
