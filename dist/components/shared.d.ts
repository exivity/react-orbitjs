import { QueryBuilder, FindRecord, FindRelatedRecord, FindRelatedRecords, FindRecords, FindRecordTerm, FindRecordsTerm, FindRelatedRecordTerm, FindRelatedRecordsTerm } from '@orbit/data';
export declare type FindQueryTerm = FindRecordTerm | FindRecordsTerm | FindRelatedRecordTerm | FindRelatedRecordsTerm;
export declare type QueryRecordExpression = FindRecord | FindRelatedRecord | FindRelatedRecords | FindRecords;
export interface RecordsToProps {
    [propName: string]: (q: QueryBuilder) => FindQueryTerm;
}
export declare type MapRecordsToPropsFn<TWrappedProps> = (props: TWrappedProps) => RecordsToProps;
export declare type MapRecordsToProps<TWrappedProps> = RecordsToProps | MapRecordsToPropsFn<TWrappedProps>;
export interface IWithOrbitOptions {
    label?: string;
}
