import { useContext, useState, useMemo } from 'react'

import { Record, IRecord } from 'resma'
import { Options } from 'lemon-curd'
import { CrudContext } from '../Provider'

export interface CrudRecord extends Record {
  save: (record: IRecord, options: Options) => void
  delete: (record: IRecord, options: Options) => void
}

export function useCrud (record: IRecord) {
  const [unUsedStateValue, updater] = useState({})
  const crudManager = useContext(CrudContext)

  return useMemo(() => {
    const CrudRecord = new Record(record, updater) as CrudRecord

    CrudRecord.save = function (options: Options) {
      return crudManager.save(CrudRecord._record, options)
    }

    CrudRecord.delete = function (options: Options) {
      return crudManager.delete(CrudRecord._record, options)
    }

    return CrudRecord
  }, [record])
}