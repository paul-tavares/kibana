/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { EuiErrorBoundary, EuiFlexGroup, EuiFlexItem, EuiSpacer } from '@elastic/eui';
import React, { Suspense } from 'react';
import styled from 'styled-components';
import { DEFAULT_PANEL, DetailParams } from '.';
import { PackageInfo } from '../../../../types';
import { AssetsFacetGroup } from '../../components/assets_facet_group';
import { CenterColumn, LeftColumn, RightColumn } from './layout';
import { OverviewPanel } from './overview_panel';
import { SideNavLinks } from './side_nav_links';
import { PackagePoliciesPanel } from './package_policies_panel';
import { SettingsPanel } from './settings_panel';
import { useExtension } from '../../../../hooks/use_extensions';
import { Loading } from '../../../../components';

type ContentProps = PackageInfo & Pick<DetailParams, 'panel'>;

const SideNavColumn = styled(LeftColumn)`
  /* 🤢🤷 https://www.styled-components.com/docs/faqs#how-can-i-override-styles-with-higher-specificity */
  &&& {
    margin-top: 77px;
  }
`;

// fixes IE11 problem with nested flex items
const ContentFlexGroup = styled(EuiFlexGroup)`
  flex: 0 0 auto !important;
`;

export function Content(props: ContentProps) {
  const { name, panel, version } = props;
  return (
    <ContentFlexGroup>
      <SideNavColumn>
        <SideNavLinks name={name} version={version} active={panel || DEFAULT_PANEL} />
      </SideNavColumn>
      <CenterColumn>
        <ContentPanel {...props} />
      </CenterColumn>
      <RightColumn>
        <RightColumnContent {...props} />
      </RightColumn>
    </ContentFlexGroup>
  );
}

type ContentPanelProps = PackageInfo & Pick<DetailParams, 'panel'>;
export function ContentPanel(props: ContentPanelProps) {
  const { panel, name, version, assets, title, removable, latestVersion } = props;
  const CustomView = useExtension(name, 'integration', 'custom');

  switch (panel) {
    case 'settings':
      return (
        <SettingsPanel
          name={name}
          version={version}
          assets={assets}
          title={title}
          removable={removable}
          latestVersion={latestVersion}
        />
      );
    case 'usages':
      return <PackagePoliciesPanel name={name} version={version} />;
    case 'custom':
      // FIXME:PT A `<Redirect>` should be used case user lands here via handcrafted link and there is no custom view
      return (
        CustomView && (
          <EuiErrorBoundary>
            <Suspense fallback={<Loading />}>
              <CustomView />
            </Suspense>
          </EuiErrorBoundary>
        )
      );
    case 'overview':
    default:
      return <OverviewPanel {...props} />;
  }
}

type RightColumnContentProps = PackageInfo & Pick<DetailParams, 'panel'>;
function RightColumnContent(props: RightColumnContentProps) {
  const { assets, panel } = props;
  switch (panel) {
    case 'overview':
      return assets ? (
        <EuiFlexGroup direction="column" gutterSize="none">
          <EuiFlexItem grow={false}>
            <AssetsFacetGroup assets={assets} />
          </EuiFlexItem>
        </EuiFlexGroup>
      ) : null;
    default:
      return <EuiSpacer />;
  }
}
