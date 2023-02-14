/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { memo, useMemo } from 'react';
import { EuiFlexGroup, EuiFlexItem, EuiText } from '@elastic/eui';
import type {
  HostPolicyResponse,
  HostPolicyResponseAppliedArtifact,
} from '../../../../common/endpoint/types';

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
          <AppliedArtifact artifact={artifact} key={artifact.sha256} />
        ))}
      </EuiText>
    );
  }
);
PolicyResponseArtifacts.displayName = 'PolicyResponseArtifacts';

interface AppliedArtifactProps {
  artifact: HostPolicyResponseAppliedArtifact;
}

const AppliedArtifact = memo<AppliedArtifactProps>(({ artifact: { name, sha256 } }) => {
  return (
    <EuiFlexGroup>
      <EuiFlexItem>{name}</EuiFlexItem>
      <EuiFlexItem grow={false}>{sha256}</EuiFlexItem>
    </EuiFlexGroup>
  );
});
AppliedArtifact.displayName = 'AppliedArtifact';
