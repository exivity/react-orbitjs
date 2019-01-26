import * as React from 'react';
import { compose } from 'recompose';

import { query, withLoader } from 'dummy-app/data';

export default compose<any, any>(
  query(() => {
    console.log('hopefully querying projects?');
    return {
      projects: q => q.findRecord('project'),
    };
  }),
  withLoader(({ loading }) => loading)
)(({ projects }) => {
  return (
    <div>
      Projects JSON:
      {JSON.stringify(projects)}
    </div>
  );
})
