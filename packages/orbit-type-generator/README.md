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
import { Record, RecordIdentity, RecordRelationship, RecordHasOneRelationship, RecordHasManyRelationship } from "@orbit/data";
import { Dict } from "@orbit/utils";
export interface UserRecord extends Record, UserRecordIdentity {
    attributes?: UserAttributes;
    relationships?: undefined;
}
export interface UserRecordIdentity extends RecordIdentity {
    type: "user";
    id: string;
}
export interface UserAttributes extends Dict<any> {
    username: string;
}
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

## Advanced

### Using TypeScript types

You can type attributes by specifying a `ts` property. The generator will
automatically import the type based on a resolved `tsconfig.json` in the
directory you're executing from.

```js
const definition = {
  models: {
    user: {
      attributes: {
        permission: { type: 'string', ts: 'UserPermission' }
      }
    }
  }
}
```

### Specify a different base directory

If you want your imports to be relative to a different directory than the
directory you're executing from, use:

```js
const types = generateTypes(schema, {
  basePath: path.resolve(__dirname, 'src')
})
```

## Todo

- [ ] Properly generate types for relationships
- [ ] Support .ts files in CLI using on-the-fly compiling