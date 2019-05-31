# orbit-type-generator

## API

```js
import { generateTypes } from 'orbit-type-generator'

const definition = {
  models: {
    user: {
      attributes: {
        username: { type: 'string' }
      }
    }
  }
}
const schema = new Schema(definition)
const types = generateTypes(schema)
```

The `types` variable now contains this code:

```ts
import {
  Record,
  RecordRelationship,
  RecordHasManyRelationship,
  RecordHasOneRelationship
} from '@orbit/data'
import { Dict } from '@orbit/utils'
interface GenericRecord<
  A extends Dict<any> | undefined = undefined,
  R extends Dict<RecordRelationship> | undefined = undefined
> extends Record {
  attributes?: A
  relationships?: R
}
export interface UserAttributes {
  username: string
}
export type UserModel = GenericRecord<UserAttributes, undefined>
```

## CLI

If you have a file `schema.js`:

```js
export default {
  models: {
    user: {
      attributes: {
        username: { type: 'string' }
      }
    }
  }
}
```

you can generate the types with:

```bash
orbit-type-generator schema.js > models.d.ts
```
