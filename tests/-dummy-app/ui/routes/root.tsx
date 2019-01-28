import * as React from 'react';
import { Switch, Route } from 'react-router-dom';

import VersionList from './version-list';
import DeliberateError from './deliberate-error';

export default class RootPage extends React.Component {
  render() {
    return (
      <div>
          <Switch>
            <Route exact path='/' component={VersionList} />
            <Route path='/deliberate-error' component={DeliberateError} />
          </Switch>
      </div>
    );
  }
}
