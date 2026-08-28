/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { Logger } from '@kbn/logging';

/**
 * Calculates a future date based on an interval value.
 * Useful for kibana background task scheduling.
 */
export const calculateDateFromInterval = (
  /**
   * The interval to be used in the format of `<number>s|m` - example: 5m
   */
  interval: string,
  startDate: Date = new Date(),
  logger?: Logger
): Date | undefined => {
  const nextRun = startDate;

  if (interval.endsWith('s')) {
    const seconds = parseInt(interval.slice(0, -1), 10);
    nextRun.setSeconds(nextRun.getSeconds() + seconds);
  } else if (interval.endsWith('m')) {
    const minutes = parseInt(interval.slice(0, -1), 10);
    nextRun.setMinutes(nextRun.getMinutes() + minutes);
  } else {
    logger?.error(`Invalid task interval [${interval}]. Unable to calculate new date/time`);
    return;
  }

  return nextRun;
};
