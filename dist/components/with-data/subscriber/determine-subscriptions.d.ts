import Store from '@orbit/store';
import { RecordsToProps, QueryRecordExpression } from '../../shared';
export interface IQuerySubscriptions {
    [propName: string]: QueryRecordExpression;
}
export declare function determineSubscriptions(dataStore: Store, recordQueries: RecordsToProps): IQuerySubscriptions;
