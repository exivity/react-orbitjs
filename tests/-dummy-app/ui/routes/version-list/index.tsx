import * as React from 'react';
import { compose } from 'recompose';

import { query, withLoader } from 'dummy-app/data';

export default compose<any, any>(
  query(() => {
    return {
      projects: q => q.findRecord('project'),
    };
  }),
  withLoader(({ loading }) => loading)
)((props) => {
  console.log(props);
  return (
    "hello"
  );
})
