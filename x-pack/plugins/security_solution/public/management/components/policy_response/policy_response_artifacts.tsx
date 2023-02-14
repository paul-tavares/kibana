/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { memo, useMemo } from 'react';
import { EuiFlexGroup, EuiFlexItem, EuiText } from '@elastic/eui';
import styled from 'styled-components';
import type {
  HostPolicyResponse,
  HostPolicyResponseAppliedArtifact,
} from '../../../../common/endpoint/types';

const ShaContainer = styled.div`
  max-width: 15ch;
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
      <EuiFlexGroup>
        <EuiFlexItem>{name}</EuiFlexItem>
        <EuiFlexItem grow={false}>
          <ShaContainer className="eui-textTruncate">{sha256}</ShaContainer>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiText>
  );
});
AppliedArtifactItem.displayName = 'AppliedArtifact';
