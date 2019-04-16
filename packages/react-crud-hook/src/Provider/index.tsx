import React, { createContext } from 'react'
import { CrudManager } from 'lemon-curd'

export const CrudContext = createContext<CrudManager>(new CrudManager({
  createRecord: () => new Promise(() => {}),
  updateRecord: () => new Promise(() => {}),
  deleteRecord: () => new Promise(() => {}),
  extensions: {}
}))

export interface Provider {
  value: CrudManager
  children: any
}

const CrudProvider = ({ value, children }: Provider) => (
  <CrudContext.Provider value={value}>
    {children}
  </CrudContext.Provider>
)

export {
  CrudManager,
  CrudProvider
}