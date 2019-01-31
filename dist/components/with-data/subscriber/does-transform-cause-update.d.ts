import Store from '@orbit/store';
import { Transform } from '@orbit/data';
import { IQuerySubscriptions } from './determine-subscriptions';
export declare enum Op {
    FIND_RECORD = "findRecord",
    FIND_RELATED_RECORD = "findRelatedRecord",
    FIND_RELATED_RECORDS = "findRelatedRecords",
    FIND_RECORDS = "findRecords",
    ADD_RECORD = "addRecord",
    REPLACE_RECORD = "replaceRecord",
    REMOVE_RECORD = "removeRecord",
    REPLACE_KEY = "replaceKey",
    REPLACE_ATTRIBUTE = "replaceAttribute",
    ADD_TO_RELATED_RECORDS = "addToRelatedRecords",
    REMOVE_FROM_RELATED_RECORDS = "removeFromRelatedRecords",
    REPLACE_RELATED_RECORD = "replaceRelatedRecord",
    REPLACE_RELATED_RECORDS = "replaceRelatedRecords"
}
/**
 * 1. Generate a list of changed records, and potentially changed related records
 * 2. Match against our list of subscriptions
 *
 * @param dataStore
 * @param transform
 * @param subscriptions
 */
export declare function doesTransformCauseUpdate<TQueryResults>(dataStore: Store, transform: Transform, subscriptions: IQuerySubscriptions, previousResults: TQueryResults): boolean;
