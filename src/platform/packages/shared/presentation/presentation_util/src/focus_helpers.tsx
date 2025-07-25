/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

const getFirstFocusable = (el: HTMLElement | null): { focus: () => void } | null => {
  const selector = 'button, [href], input, select, textarea, [tabindex]';
  if (!el) return null;
  if (el.matches(selector)) return el;
  return el.querySelector(selector) as HTMLElement | null;
};

export const focusFirstFocusable = (elId: Element | null) => {
  if (!elId) return;
  const focusable = getFirstFocusable(elId as HTMLElement);
  setTimeout(() => {
    if (!elId.contains(document.activeElement)) {
      // only focus on the first element of the flyout if the currently focused element is not a descendant of the flyout (ie. the focus was not set by the content)
      focusable?.focus();
    }
  });
};
