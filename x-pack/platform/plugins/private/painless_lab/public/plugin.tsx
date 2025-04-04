/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { firstValueFrom } from 'rxjs';
import { i18n } from '@kbn/i18n';
import { Plugin, CoreSetup } from '@kbn/core/public';

import { ILicense } from '@kbn/licensing-plugin/common/types';
import { PLUGIN } from '../common/constants';

import { PluginDependencies } from './types';
import { getLinks } from './links';

const checkLicenseStatus = (license: ILicense) => {
  const { state, message } = license.check(PLUGIN.id, PLUGIN.minimumLicenseType);
  return state === 'valid' ? { valid: true } : { valid: false, message };
};

export class PainlessLabUIPlugin implements Plugin<void, void, PluginDependencies> {
  public setup(
    { http, getStartServices, uiSettings }: CoreSetup,
    { devTools, home, licensing }: PluginDependencies
  ) {
    home.featureCatalogue.register({
      id: PLUGIN.id,
      title: i18n.translate('xpack.painlessLab.registryProviderTitle', {
        defaultMessage: 'Painless Lab (beta)',
      }),
      description: i18n.translate('xpack.painlessLab.registryProviderDescription', {
        defaultMessage: 'Simulate and debug painless code.',
      }),
      icon: 'empty',
      path: '/app/dev_tools#/painless_lab',
      showOnHomePage: false,
      category: 'admin',
    });

    const devTool = devTools.register({
      id: 'painless_lab',
      order: 7,
      isBeta: true,
      title: i18n.translate('xpack.painlessLab.displayName', {
        defaultMessage: 'Painless Lab',
      }),
      enableRouting: false,
      disabled: false,
      mount: async ({ element }) => {
        const [core] = await getStartServices();

        const { notifications, docLinks, chrome, settings, ...startServices } = core;

        const license = await firstValueFrom(licensing.license$);
        const licenseStatus = checkLicenseStatus(license);

        if (!licenseStatus.valid) {
          notifications.toasts.addDanger(licenseStatus.message!);
          window.location.hash = '/dev_tools';
          return () => {};
        }

        const { renderApp } = await import('./application');
        const tearDownApp = renderApp(element, {
          http,
          uiSettings,
          links: getLinks(docLinks),
          chrome,
          settings,
          startServices,
        });

        return () => {
          tearDownApp();
        };
      },
    });

    licensing.license$.subscribe((license) => {
      if (!checkLicenseStatus(license).valid && !devTool.isDisabled()) {
        devTool.disable();
      } else if (devTool.isDisabled()) {
        devTool.enable();
      }
    });
  }

  public start() {}

  public stop() {}
}
