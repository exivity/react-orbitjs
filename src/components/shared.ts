import { QueryBuilder, FindRecord, FindRelatedRecord, FindRelatedRecords, FindRecords, FindRecordTerm, FindRecordsTerm, FindRelatedRecordTerm, FindRelatedRecordsTerm } from '@orbit/data';

export type FindQueryTerm =
  | FindRecordTerm
  | FindRecordsTerm
  | FindRelatedRecordTerm
  | FindRelatedRecordsTerm;

export type QueryRecordExpression =
  | FindRecord
  | FindRelatedRecord
  | FindRelatedRecords
  | FindRecords;


export interface RecordsToProps {
  [propName: string]: (q: QueryBuilder) => FindQueryTerm;
}

export type MapRecordsToPropsFn<TWrappedProps> = (props: TWrappedProps) => RecordsToProps;

export type MapRecordsToProps<TWrappedProps> =
  | RecordsToProps
  | MapRecordsToPropsFn<TWrappedProps>


export interface IWithOrbitOptions {
  label?: string;

}