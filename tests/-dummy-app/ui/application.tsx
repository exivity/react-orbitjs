import * as React from 'react';
import { BrowserRouter, Router as GenericRouter } from 'react-router-dom';

import { DataProvider } from 'dummy-app/data';

import RootRoute from 'dummy-app/ui/routes/root';

interface IProps {
  initialState: any;
  history: any;
}

export default class Application extends React.Component<IProps> {

  render() {
    const { initialState, history } = this.props;

    const Router = history ? GenericRouter : BrowserRouter;
    const routerProps = {};

    if (history) {
      routerProps.history = history;
    }

    return (
      <DataProvider>
        <Router {...routerProps}>
          <RootRoute />
        </Router>
      </DataProvider>
    );
  }
}
