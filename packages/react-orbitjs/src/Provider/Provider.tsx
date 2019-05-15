import React from 'react'
import { CrudProvider, CrudManager } from 'react-crud-hook'
import { QueryProvider, QueryManager } from 'orbit-query-hook'
import { Crud } from 'lemon-curd'
import Store from '@orbit/store'

export interface DataProvider {
  crud: Crud
  dataStore: Store
  children: any
}

export const DataProvider = ({ children, crud, dataStore }: DataProvider) => {
  const crudManager: CrudManager = new CrudManager(crud)
  const queryManager: QueryManager = new QueryManager(dataStore)

  return (
     <CrudProvider value={crudManager}>
       <QueryProvider value={queryManager}>
         {children}
       </QueryProvider>
     </CrudProvider>
  )
}