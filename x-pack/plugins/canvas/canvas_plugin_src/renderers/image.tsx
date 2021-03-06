/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import ReactDOM from 'react-dom';
import React from 'react';
import { elasticLogo, isValidUrl } from '../../../../../src/plugins/presentation_util/common/lib';
import { Return as Arguments } from '../functions/common/image';
import { RendererStrings } from '../../i18n';
import { RendererFactory } from '../../types';

const { image: strings } = RendererStrings;

export const image: RendererFactory<Arguments> = () => ({
  name: 'image',
  displayName: strings.getDisplayName(),
  help: strings.getHelpDescription(),
  reuseDomNode: true,
  render(domNode, config, handlers) {
    const dataurl = isValidUrl(config.dataurl) ? config.dataurl : elasticLogo;

    const style = {
      height: '100%',
      backgroundImage: `url(${dataurl})`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center center',
      backgroundSize: config.mode,
    };

    ReactDOM.render(<div style={style} />, domNode, () => handlers.done());

    handlers.onDestroy(() => ReactDOM.unmountComponentAtNode(domNode));
  },
});
