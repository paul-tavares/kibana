/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { memo, useMemo } from 'react';
import { EuiBadge, EuiButtonIcon, EuiFlexGroup, EuiFlexItem, EuiText, EuiCopy } from '@elastic/eui';
import styled from 'styled-components';
import { i18n } from '@kbn/i18n';
import type {
  HostPolicyResponse,
  HostPolicyResponseAppliedArtifact,
} from '../../../../common/endpoint/types';

const ShaContainer = styled.span`
  display: inline-block;
  max-width: 12ch;
`;

export interface PolicyResponseArtifactsProps {
  appliedArtifacts: HostPolicyResponse['Endpoint']['policy']['applied']['artifacts'];
  /** Default is `both` */
  type?: 'global' | 'user' | 'both';
}

export const PolicyResponseArtifacts = memo<PolicyResponseArtifactsProps>(
  ({ appliedArtifacts, type = 'both' }) => {
    const items = useMemo(() => {
      return type === 'both'
        ? [...appliedArtifacts.global.identifiers, ...appliedArtifacts.user.identifiers]
        : appliedArtifacts[type].identifiers;
    }, [appliedArtifacts, type]);

    return (
      <EuiText>
        {items.map((artifact) => (
          <AppliedArtifactItem artifact={artifact} key={artifact.sha256} />
        ))}
      </EuiText>
    );
  }
);
PolicyResponseArtifacts.displayName = 'PolicyResponseArtifacts';

interface AppliedArtifactProps {
  artifact: HostPolicyResponseAppliedArtifact;
}

/**
 * A single artifact item that was applied to a host running endpoint
 */
export const AppliedArtifactItem = memo<AppliedArtifactProps>(({ artifact: { name, sha256 } }) => {
  return (
    <EuiText>
      <EuiFlexGroup wrap={false} responsive={false} gutterSize="s">
        <EuiFlexItem className="eui-textTruncate">
          <div className="eui-TextTruncate" title={name}>
            {name}
          </div>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <HashDisplay value={sha256} />
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiText>
  );
});
AppliedArtifactItem.displayName = 'AppliedArtifact';

export interface HashDisplayProps {
  value: string;
  type?: string;
}

const HashDisplay = memo<HashDisplayProps>(({ value, type = 'sha256' }) => {
  return (
    <EuiFlexGroup responsive={false} wrap={false} gutterSize="xs" alignItems="center">
      <EuiFlexItem grow={false}>
        <EuiBadge color="hollow">{type}</EuiBadge>
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <ShaContainer className="eui-textTruncate">{value}</ShaContainer>
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiCopy
          textToCopy={value}
          beforeMessage={i18n.translate(
            'xpack.securitySolution.policyResponseArtifacts.copyBeforeMessage',
            { defaultMessage: 'Copy artifact hash' }
          )}
        >
          {(copy) => {
            return <EuiButtonIcon iconType="copy" onClick={copy} />;
          }}
        </EuiCopy>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
});
HashDisplay.displayName = 'HashDisplay';
