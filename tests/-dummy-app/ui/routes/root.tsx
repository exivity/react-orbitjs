import * as React from 'react';
import { Switch, Route } from 'react-router-dom';

import VersionList from './version-list';

export default class RootPage extends React.Component {
  render() {
    return (
      <div>
          <Switch>
            <Route path='/' component={VersionList} />
          </Switch>
      </div>
    );
  }
}
