import { Schema } from "@orbit/data"
import Store from "@orbit/store"
import { DateTime } from "luxon"

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

const store = new Store({schema})

store.update(t => t.addRecord({
    type: "todo",
    id: "my-first-todo",
    attributes: {
      description: "Read react-orbit documentation",
      done: false,
      added: DateTime.local().toString()
    },
  },
))

export default store