import * as React from 'react';


import Store from '@orbit/store';
import { Source, QueryOrExpression, TransformOrOperations } from '@orbit/data';

import { OrbitContext } from './orbit-context';

export interface IProps {
  dataStore: Store;
  sources: Source[];
}

export interface IState {
  dataStore: Store;
  sources: Source[];

  // legacy API
  updateStore: (queryOrExpression: TransformOrOperations, options?: object, id?: string) => any; 
  queryStore: (queryOrExpression: QueryOrExpression, options?: object, id?: string) => any;
}

export class DataProvider extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      dataStore: props.dataStore,
      sources: props.sources,
      
      // legacy API
      updateStore: props.dataStore.update,
      queryStore: props.dataStore.cache.query
    };
  }

  render() {
    return (
      <OrbitContext.Provider value={this.state}>
        {this.props.children}
      </OrbitContext.Provider>
    );
  }
}

export default DataProvider;
export const OrbitProvider = DataProvider;