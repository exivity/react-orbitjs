import * as React from 'react';
import { compose } from 'recompose';

import { IProvidedProps as IQueryProps} from 'dummy-app/data/query';
import { query, withLoader } from 'dummy-app/data';
import { QueryBuilder } from '@orbit/data';

interface IQueriedProps {
  requests: any[];
}

export default compose<any, any>(
  query(() => {
    return {
      requests: (q: QueryBuilder) => q.findRecords('request'),
    };
  }, { useRemoteDirectly: true }),
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
