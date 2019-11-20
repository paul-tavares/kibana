/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import { AppMountContext, AppMountParameters } from 'kibana/public';

class App extends PureComponent<{
  context: AppMountContext;
}> {
  render() {
    return (
      <div>
        <h1>Test API Response</h1>
      </div>
    );
  }

  async componentDidMount(): Promise<void> {
    const response = await this.props.context.core.http.get(
      '/app/api_response_test/_api/invalid-route'
    );
    console.log(response); //eslint-disable-line
  }
}

export const renderApp = (context: AppMountContext, { element }: AppMountParameters) => {
  ReactDOM.render(<App context={context} />, element);

  return () => ReactDOM.unmountComponentAtNode(element);
};
