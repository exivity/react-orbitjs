import * as Data from "@orbit/data"
import * as Memory from "@orbit/memory"
import * as Records from "@orbit/records"

export function getOrbitSchemaAndStore(models) {
  // console.log({ Data, Memory, Records })
  if (typeof Memory.MemorySource === 'undefined') {
    // OrbitJs 0.16.x
    const schema = new Data.Schema(models)
    return {
      schema,
      memory: new Memory.default({ schema })
    }
  } else {
    // OrbitJs 0.17.x
    const recordSchema = new Records.RecordSchema(models)
    return {
      schema: recordSchema,
      memory: new Memory.MemorySource({ schema: recordSchema })
    }
  }
}