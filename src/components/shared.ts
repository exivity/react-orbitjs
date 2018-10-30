import { QueryBuilder } from '@orbit/data';

export interface RecordsToProps {
  [key: string]: (q: QueryBuilder) => any;
}

export type MapRecordsToPropsFn<TWrappedProps> = (props: TWrappedProps) => RecordsToProps;

export type MapRecordsToProps<TWrappedProps> =
  | RecordsToProps
  | MapRecordsToPropsFn<TWrappedProps>
