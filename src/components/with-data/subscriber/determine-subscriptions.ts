import Store from '@orbit/store';
import { RecordsToProps, QueryRecordExpression } from '../../shared';

export interface IQuerySubscriptions {
  [propName: string]: QueryRecordExpression;
}

export function determineSubscriptions(
  dataStore: Store,
  recordQueries: RecordsToProps
): IQuerySubscriptions {
  const recordQueryKeys = Object.keys(recordQueries);
  const subscriptions: IQuerySubscriptions = {};

  // Iterate all queries, to make a list of models to listen for
  recordQueryKeys.forEach(prop => {
    const queryExpression = recordQueries[prop](dataStore.queryBuilder).expression;

    subscriptions[prop] = queryExpression;
  });

  return subscriptions;
}
