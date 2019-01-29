import Store from '@orbit/store';
import { RecordsToProps } from '../shared';
import { RecordIdentity } from '@orbit/data';
import { modelForRelationOf } from './helpers';

export interface IQuerySubscription {
  type: string;
  // empty if subscribing to all of this type
  id?: string;
  relatedTo?: RecordIdentity;
}
export interface IQuerySubscriptions {
  [propName: string]: IQuerySubscription[];
}

export function determineSubscriptions(
  dataStore: Store,
  recordQueries: RecordsToProps
): IQuerySubscriptions {
  const recordQueryKeys = Object.keys(recordQueries);
  const subscriptions: IQuerySubscriptions = {};

  // Iterate all queries, to make a list of models to listen for
  recordQueryKeys.forEach(prop => {
    let expression;
    const queryExpression = recordQueries[prop](dataStore.queryBuilder).expression;

    subscriptions[prop] = [];

    switch (queryExpression.op) {
      case 'findRecord':
        expression = queryExpression;
        subscriptions[prop].push({ type: expression.record.type, id: expression.record.id });
        break;

      case 'findRecords':
        expression = queryExpression;
        subscriptions[prop].push({ type: expression.type! });
        break;

      case 'findRelatedRecord':
      case 'findRelatedRecords':
        expression = queryExpression;

        subscriptions[prop].push({ type: expression.record.type});

        // subscribe to the relationship of this particular record
        let model = modelForRelationOf(dataStore, expression.record.type, expression.relationship);

        subscriptions[prop].push({ type: model!, relatedTo: expression.record });
        break;
      default:
        throw new Error(`Query Expression (${(queryExpression as any).op}) is not supported as a prop.`);
    }
  });

  return subscriptions;
}
