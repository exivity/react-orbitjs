import * as React from 'react';
import { compose } from 'recompose';

import { IQueryProps, query} from 'react-orbitjs';
import { withLoader } from 'dummy-app/data';
import { QueryBuilder } from '@orbit/data';

interface IQueriedProps {
  requests: any[];
}

export default compose<any, any>(
  query(() => {
    return {
      requests: (q: QueryBuilder) => q.findRecords('requests'),
    };
  }),
  withLoader((props: IQueryProps<IQueriedProps>) => {
    return props.isLoading || !props.requests;
  })
)(({ requests }: IQueriedProps) => {
  return (
    <div>
      fetch result:
      {JSON.stringify(requests)}
    </div>
  );
})
