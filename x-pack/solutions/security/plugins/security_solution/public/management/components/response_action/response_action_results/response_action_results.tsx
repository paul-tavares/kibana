/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { memo } from 'react';
import type { EuiTextProps } from '@elastic/eui';
import { EuiText } from '@elastic/eui';
import type { ActionDetails, MaybeImmutable } from '../../../../../common/endpoint/types';
import { useTestIdGenerator } from '../../../hooks/use_test_id_generator';

export interface ResponseActionResultsProps {
  action: MaybeImmutable<ActionDetails>;
  /** The agent id to display the result for. If undefined, the output for ALL agents will be displayed */
  agentId?: string;
  textSize?: EuiTextProps['size'];
  'data-test-subj'?: string;
}

/**
 * Display the results of a response action
 */
export const ResponseActionResults = memo<ResponseActionResultsProps>(
  ({ action, agentId, textSize = 's', 'data-test-subj': dataTestSubj }) => {
    const getTestId = useTestIdGenerator(dataTestSubj);

    return (
      <EuiText data-test-subj={getTestId('container')} size={textSize}>
        {'ResponseActionResults placeholder'}
      </EuiText>
    );
  }
);
ResponseActionResults.displayName = 'ResponseActionResults';
