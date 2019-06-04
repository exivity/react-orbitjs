# orbit-type-generator

[![npm](https://img.shields.io/npm/v/orbit-type-generator.svg)](https://www.npmjs.com/package/orbit-type-generator)
[![Travis](https://img.shields.io/travis/exivity/react-orbitjs.svg)](https://travis-ci.org/exivity/react-orbitjs)
[![Codecov](https://img.shields.io/codecov/c/github/exivity/react-orbitjs.svg)](https://codecov.io/gh/exivity/react-orbitjs)
[![Code Climate](https://img.shields.io/codeclimate/maintainability/exivity/react-orbitjs.svg)](https://codeclimate.com/github/exivity/react-orbitjs)
[![Gitter](https://badges.gitter.im/exivity/react-orbitjs.svg)](https://gitter.im/exivity/react-orbitjs)

> [TypeScript](https://www.typescriptlang.org/) type generator for [Orbit](http://orbitjs.com/) schema definitions.


## API

### `generateTypes(schema: Schema): string`

Example use case:

```js
import { generateTypes } from 'orbit-type-generator'

const definition = {
  models: {
    user: {
      attributes: {
        username: { type: 'string' }
      },
      relationships: {
        group: { type: 'hasOne', model: 'group' }
      }
    },
    group: {
      attributes: {
        name: { type: 'string' }
      },
      relationships: {
        users: { type: 'hasMany', model: 'user' }
      }
    }
  }
}
const schema = new Schema(definition)

generateTypes(schema)
```

Would returns this string:

```ts
// some statements omitted for brevity
export interface UserRecord extends Record, UserRecordIdentity {
    attributes?: UserAttributes;
    relationships?: UserRelationships;
}
export interface UserRecordIdentity extends RecordIdentity {
    type: "user";
    id: string;
}
export interface UserAttributes extends Dict<any> {
    username: string;
}
export interface UserRelationships extends Dict<RecordRelationship> {
    group: RecordHasOneRelationship<GroupRecordIdentity>;
}
export interface GroupRecord extends Record, GroupRecordIdentity {
    attributes?: GroupAttributes;
    relationships?: GroupRelationships;
}
export interface GroupRecordIdentity extends RecordIdentity {
    type: "group";
    id: string;
}
export interface GroupAttributes extends Dict<any> {
    name: string;
}
export interface GroupRelationships extends Dict<RecordRelationship> {
    users: RecordHasManyRelationship<UserRecordIdentity>;
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

You can type attributes using TypeScript types or interfaces.
The generator will automatically import the type based on a resolved
`tsconfig.json` in the directory you're executing from.

```js
const definition = {
  models: {
    user: {
      attributes: {
        permission: { type: 'UserPermission' }
      }
    }
  }
}
```

You can optionally specify a fallback type to use if TypeScript can't resolve
the specified type:

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

const schema = new Schema(definition)
const types = generateTypes(schema, { tsProperty: 'ts' })
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

- [x] Properly generate types for relationships
- [ ] Option to allow extra properties (toggle attr/rel extends statements)
- [ ] Support .ts files in CLI using on-the-fly compiling