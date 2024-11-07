/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { memo, useCallback, useState } from 'react';
import {
  EuiButton,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutHeader,
  EuiTitle,
  useEuiTheme,
  useGeneratedHtmlId,
} from '@elastic/eui';
import { FormattedMessage } from '@kbn/i18n-react';
import { FileBrowser } from './file_browser';
import type { EndpointResponderExtensionComponentProps } from '../types';

export const FileBrowserButton = memo<EndpointResponderExtensionComponentProps>((props) => {
  const { euiTheme } = useEuiTheme();
  const [showActionLogFlyout, setShowActionLogFlyout] = useState<boolean>(false);
  const toggleActionLog = useCallback(() => {
    setShowActionLogFlyout((prevState) => {
      return !prevState;
    });
  }, []);

  const responderActionLogFlyoutTitleId = useGeneratedHtmlId({
    prefix: 'responderActionFileBrowserFlyoutTitle',
  });

  return (
    <>
      <EuiButton
        onClick={toggleActionLog}
        disabled={showActionLogFlyout}
        iconType="folderOpen"
        data-test-subj="responderShowActionLogButton"
      >
        <FormattedMessage
          id="xpack.securitySolution.fileBrowserButton.label"
          defaultMessage="Host file browser"
        />
      </EuiButton>
      {showActionLogFlyout && (
        <EuiFlyout
          onClose={toggleActionLog}
          size="l"
          paddingSize="l"
          aria-labelledby={responderActionLogFlyoutTitleId}
          data-test-subj="responderActionLogFlyout"
          // EUI TODO: This z-index override of EuiOverlayMask is a workaround, and ideally should be resolved with a cleaner UI/UX flow long-term
          maskProps={{ style: `z-index: ${(euiTheme.levels.flyout as number) + 3}` }} // we need this flyout to be above the timeline flyout (which has a z-index of 1002)
        >
          <EuiFlyoutHeader hasBorder>
            <EuiTitle size="m">
              <h1 id={responderActionLogFlyoutTitleId}>{'File Browser (DEV)'}</h1>
            </EuiTitle>
          </EuiFlyoutHeader>
          <EuiFlyoutBody>
            {/* FIXME:PT implement agent type */}
            <FileBrowser agentId={props.meta.agentId} agentType={'endpoint'} />
          </EuiFlyoutBody>
        </EuiFlyout>
      )}
    </>
  );
});
FileBrowserButton.displayName = 'FileBrowserButton';
