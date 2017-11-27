import { Schema } from "@orbit/data"
import Store from "@orbit/store"

import { earth, venus, theMoon } from "./repository"

const schemaDefinition = {
  models: {
    planet: {
      attributes: {
        name: {type: "string"},
        classification: {type: "string"},
      },
      relationships: {
        moons: {type: "hasMany", model: "moon", inverse: "planet"},
      },
    },
    moon: {
      attributes: {
        name: {type: "string"},
      },
      relationships: {
        planet: {type: "hasOne", model: "planet", inverse: "moons"},
      },
    },
  },
}

const schema = new Schema(schemaDefinition)

const store = new Store({schema})

store.update(t => [
  t.addRecord(venus),
  t.addRecord(earth),
  t.addRecord(theMoon),
])

export default store