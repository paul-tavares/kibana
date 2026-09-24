/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { memo, useMemo } from 'react';
import type { EuiTextProps } from '@elastic/eui';
import { EuiText, EuiHorizontalRule } from '@elastic/eui';
import type { KillSuspendProcessActionResultProps } from '../../kill_process_action_result';
import { KillSuspendProcessActionResult } from '../../kill_process_action_result';
import { OUTPUT_MESSAGES } from '../../endpoint_response_actions_list/translations';
import { KeyValueDisplay } from '../../key_value_display';
import { useTestIdGenerator } from '../../../hooks/use_test_id_generator';
import type { ActionDetails, MaybeImmutable } from '../../../../../common/endpoint/types';

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
    const agents = useMemo(() => {
      return agentId ? [agentId] : action.agents;
    }, [action.agents, agentId]);

    const isMultiAgent = agents.length > 1;
    const command = action.command;

    if (agentId && !action.agents.includes(agentId)) {
      window.console.warn(
        `EndpointUploadActionResult: Agent id [${agentId}] not in list of agents for action [${command} - ${action.id}]`
      );
      return <></>;
    }

    return (
      <EuiText data-test-subj={getTestId()} size={textSize}>
        {agents.map((hostAgentId, index) => {
          const agentActionState = action.agentState[hostAgentId];
          const hostName = action.hosts[hostAgentId]?.name ?? hostAgentId;
          const hostStatusMessage = !agentActionState.isCompleted
            ? OUTPUT_MESSAGES.isPending(command)
            : agentActionState.wasCanceled
            ? OUTPUT_MESSAGES.wasCanceled(command)
            : agentActionState.wasSuccessful
            ? OUTPUT_MESSAGES.wasSuccessful(command)
            : action.isExpired
            ? OUTPUT_MESSAGES.hasExpired(command)
            : OUTPUT_MESSAGES.hasFailed(command);

          return (
            <div data-test-subj={getTestId('hostStatusAndResults')} key={hostAgentId}>
              {isMultiAgent ? (
                <>
                  <KeyValueDisplay name={hostName} value={hostStatusMessage} />
                  {agentActionState.isCompleted && (
                    <div>
                      {OUTPUT_MESSAGES.expandSection.completedAt} {agentActionState.completedAt}
                    </div>
                  )}
                </>
              ) : (
                hostStatusMessage
              )}

              {(command === 'kill-process' || command === 'suspend-process') && (
                <KillSuspendProcessActionResult
                  action={action as KillSuspendProcessActionResultProps['action']}
                  agentId={hostAgentId}
                  textSize={textSize}
                  data-test-subj={getTestId('results')}
                />
              )}

              {isMultiAgent && index !== agents.length - 1 && (
                <EuiHorizontalRule margin="xl" size="half" />
              )}
            </div>
          );
        })}
      </EuiText>
    );
  }
);
ResponseActionResults.displayName = 'ResponseActionResults';
