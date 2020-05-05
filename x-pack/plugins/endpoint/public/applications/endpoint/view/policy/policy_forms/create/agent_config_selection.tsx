/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { memo, useCallback, useMemo } from 'react';
import {
  EuiBadge,
  EuiButton,
  EuiEmptyPrompt,
  EuiSelectable,
  EuiSelectableMessage,
  EuiText,
  EuiToolTip,
} from '@elastic/eui';
import { EuiSelectableProps } from '@elastic/eui/src/components/selectable/selectable';
import { useDispatch } from 'react-redux';
import { usePolicyListSelector } from '../../policy_hooks';
import {
  agentConfigs,
  configId,
  isFetchingAgentConfigs,
} from '../../../../store/policy_list/selectors';
import { LinkToApp } from '../../../components/link_to_app';
import { PolicyListAction } from '../../../../store/policy_list';
import { useNavigateToAppEventHandler } from '../../../hooks/use_navigate_to_app_event_handler';

export const AgentConfigSelection = memo(() => {
  const dispatch = useDispatch<(a: PolicyListAction) => void>();
  const isFetching = usePolicyListSelector(isFetchingAgentConfigs);
  const configs = usePolicyListSelector(agentConfigs);
  const selectedConfig = usePolicyListSelector(configId);

  const selectionOptions = useMemo<EuiSelectableProps['options']>(() => {
    return configs.map(config => {
      return {
        key: config.id,
        label: config.name,
        append: (
          <EuiToolTip position="left" content="Number of Agents enrolled">
            <EuiBadge>{config.agents}</EuiBadge>
          </EuiToolTip>
        ),
        checked: selectedConfig === config.id ? 'on' : undefined,
      };
    });
  }, [configs, selectedConfig]);

  const handleSelectableOnChange = useCallback<(o: EuiSelectableProps['options']) => void>(
    changedOptions => {
      changedOptions.some(option => {
        if ('checked' in option && option.checked === 'on') {
          dispatch({
            type: 'userSelectedAgentConfiguration',
            payload: {
              configId: option.key as string,
            },
          });
          return true;
        }
      });
    },
    [dispatch]
  );

  return (
    <>
      <EuiSelectable
        options={selectionOptions}
        singleSelection="always"
        isLoading={isFetching}
        height={200}
        listProps={{ bordered: true, singleSelection: true }}
        onChange={handleSelectableOnChange}
      >
        {list =>
          isFetching ? (
            <EuiSelectableMessage>Loading agent configs</EuiSelectableMessage>
          ) : selectionOptions.length ? (
            list
          ) : (
            <NoAgentConfigsPrompt />
          )
        }
      </EuiSelectable>
      {(!isFetching && selectionOptions.length && (
        <EuiText size="xs">
          <LinkToApp appId={'ingestManager'} appPath="#/configs?create">
            Or Create new agent configuration
          </LinkToApp>
        </EuiText>
      )) ||
        null}
    </>
  );
});

const NoAgentConfigsPrompt = memo(() => {
  const handleCreateButtonClick = useNavigateToAppEventHandler('ingestManager', {
    path: '#/configs?create',
  });
  return (
    <EuiEmptyPrompt
      iconType="savedObjectsApp"
      title={<h3>No configuration available</h3>}
      titleSize="s"
      body={
        <EuiText size="s">
          <p>
            There are no eligible agent configurations (one that does not yet include Endpoint
            Security). In order to proceed, an agent configuration must be created first. Click
            below to navigate over to Ingest Manager and create one.
          </p>
        </EuiText>
      }
      actions={
        <EuiButton color="primary" fill onClick={handleCreateButtonClick}>
          Create Agent Configuration
        </EuiButton>
      }
    />
  );
});
