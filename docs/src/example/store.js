import {Schema} from "@orbit/data"
import MemorySource from "@orbit/memory"
import {DateTime} from "luxon"

const schemaDefinition = {
  models: {
    todo: {
      attributes: {
        description: {type: "string"},
        done: {type: "boolean"},
        added: {type: "date"},
      },
    },
  },
}

const schema = new Schema(schemaDefinition)

const memory = new MemorySource({schema})

memory.update(t => t.addRecord({
    type: "todo",
    id: "my-first-todo",
    attributes: {
      description: "Read react-orbitjs documentation",
      done: false,
      added: DateTime.local().toString()
    },
  },
))

export default memory
