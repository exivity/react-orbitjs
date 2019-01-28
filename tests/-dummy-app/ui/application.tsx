import * as React from 'react';
import { RouterProps } from 'react-router';
import { BrowserRouter, Router as GenericRouter } from 'react-router-dom';
import { APIProvider } from 'react-orbitjs';

import { schema, keyMap } from 'dummy-app/data';

import RootRoute from 'dummy-app/ui/routes/root';
import { strategies } from 'react-orbitjs';

interface IProps {
  history: any;
}

export default class Application extends React.Component<IProps> {
  render() {
    const { history } = this.props;

    const Router = history ? GenericRouter : BrowserRouter;
    const routerProps: Partial<RouterProps> = {};

    if (history) {
      routerProps.history = history;
    }

    const dataProps = {
      storeCreator: () =>
        strategies.pessimisticWithRemoteIds.createStore(
          'https://private-anon-29c50a7894-accountjsonapi.apiary-mock.com/',
          schema,
          keyMap
        ),
    };

    return (
      <APIProvider {...dataProps}>
        <Router {...(routerProps as RouterProps)}>
          <RootRoute />
        </Router>
      </APIProvider>
    );
  }
}
