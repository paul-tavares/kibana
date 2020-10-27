/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import React, { Fragment } from 'react';
import { i18n } from '@kbn/i18n';
import { EuiButtonEmpty } from '@elastic/eui';
import { PackageInfo, entries, DetailViewPanelName } from '../../../../types';
import { useLink } from '../../../../hooks';
import { useGetPackageInstallStatus } from '../../hooks';
import { useExtension } from '../../../../hooks/use_extensions';

export type NavLinkProps = Pick<PackageInfo, 'name' | 'version'> & {
  active: DetailViewPanelName;
};

const PanelDisplayNames: Record<DetailViewPanelName, string> = {
  overview: i18n.translate('xpack.ingestManager.epm.packageDetailsNav.overviewLinkText', {
    defaultMessage: 'Overview',
  }),
  usages: i18n.translate('xpack.ingestManager.epm.packageDetailsNav.packagePoliciesLinkText', {
    defaultMessage: 'Usages',
  }),
  custom: i18n.translate('xpack.ingestManager.epm.packageDetailsNav.packageCustomLinkText', {
    defaultMessage: 'Custom',
  }),
  settings: i18n.translate('xpack.ingestManager.epm.packageDetailsNav.settingsLinkText', {
    defaultMessage: 'Settings',
  }),
};

export function SideNavLinks({ name, version, active }: NavLinkProps) {
  const { getHref } = useLink();
  const getPackageInstallStatus = useGetPackageInstallStatus();
  const packageInstallStatus = getPackageInstallStatus(name);
  const CustomView = useExtension(name, 'integration', 'custom');

  return (
    <Fragment>
      {entries(PanelDisplayNames).map(([panel, display]) => {
        if (panel === 'custom' && !CustomView) {
          return null;
        }

        return (
          <div key={panel}>
            <EuiButtonEmpty
              href={getHref('integration_details', { pkgkey: `${name}-${version}`, panel })}
            >
              {active === panel ? <strong>{display}</strong> : display}
            </EuiButtonEmpty>
          </div>
        );
      })}
    </Fragment>
  );
}
