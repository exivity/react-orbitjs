import path from 'path'
import { Schema, SchemaSettings } from '@orbit/data'
import { generateTypes } from '../generator'

describe('generateTypes', () => {
  // Basic

  it('should generate a header', async () => {
    const definition: SchemaSettings = {
      models: {}
    }
    const types = generateTypes(new Schema(definition))
    expect(types).toContain(`Record`)
  })

  it('should generate a user record interface', async () => {
    const definition = {
      models: {
        user: {}
      }
    }
    const types = generateTypes(new Schema(definition))
    expect(types).toContain(`UserRecord extends Record, UserRecordIdentity`)
  })

  it('should generate a user identity interface', async () => {
    const definition = {
      models: {
        user: {}
      }
    }
    const types = generateTypes(new Schema(definition))
    expect(types).toContain(`interface UserRecordIdentity`)
  })

  it('should generate attributes', async () => {
    const definition = {
      models: {
        user: {
          attributes: {
            username: { type: 'string' }
          }
        }
      }
    }
    const types = generateTypes(new Schema(definition))
    expect(types).toContain(`UserAttributes`)
    expect(types).toContain(`username: string`)
  })

  it('should generate relationships', async () => {
    const definition = {
      models: {
        user: {
          relationships: {
            group: { type: 'hasOne' }
          }
        }
      }
    } as const
    const types = generateTypes(new Schema(definition))
    expect(types).toContain(`UserRelationships`)
    expect(types).toContain(`group: RecordHasOneRelationship`)
  })

  it('should generate both attributes and relationships', async () => {
    const definition = {
      models: {
        user: {
          attributes: {
            username: { type: 'string' }
          },
          relationships: {
            group: { type: 'hasOne' }
          }
        }
      }
    } as const
    const types = generateTypes(new Schema(definition))
    expect(types).toContain(`UserAttributes`)
    expect(types).toContain(`UserRelationships`)
  })

  it('should generate neither attributes and relationships', async () => {
    const definition = {
      models: {
        user: {}
      }
    } as const
    const types = generateTypes(new Schema(definition))
    expect(types).not.toContain(`UserAttributes`)
    expect(types).not.toContain(`UserRelationships`)
  })

  it('should generate extra imports', async () => {
    const definition = {
      models: {}
    }
    const types = generateTypes(new Schema(definition), {
      extraImports: [
        { type: 'Type', modulePath: path.resolve(__dirname, '..') }
      ]
    })
    expect(types).toContain(`import { Type } from "./src"`)
  })

  it('should generate extra imports from a different base directory', async () => {
    const definition = {
      models: {}
    }
    const types = generateTypes(new Schema(definition), {
      basePath: path.resolve(__dirname, '..'),
      extraImports: [
        { type: 'Type', modulePath: path.resolve(__dirname, '..') }
      ]
    })
    expect(types).toContain(`import { Type } from "."`)
  })

  // Attribute cases

  it('should generate attributes as any if type if not set or unknown', async () => {
    const definition = {
      models: {
        user: {
          attributes: {
            username: {},
            password: { type: 'foo' }
          }
        }
      }
    }
    const types = generateTypes(new Schema(definition))
    expect(types).toContain(`username: any`)
    expect(types).toContain(`password: any`)
  })

  it('should generate typescript import for typed attributes', async () => {
    const definition = {
      models: {
        user: {
          attributes: {
            permission: { type: 'AttributeDefinition' }
          }
        }
      }
    }
    const types = generateTypes(new Schema(definition))
    expect(types).toContain(`import { AttributeDefinition } from "./src/types"`)
    expect(types).toContain(`permission: AttributeDefinition`)
  })

  it('should generate typescript import for multiple typed attributes', async () => {
    const definition = {
      models: {
        user: {
          attributes: {
            permission: { type: 'AttributeDefinition' },
            group: { type: 'ModelDefinition' }
          }
        }
      }
    }
    const types = generateTypes(new Schema(definition))
    expect(types).toContain(
      `import { AttributeDefinition, ModelDefinition } from "./src/types"`
    )
  })

  it('should generate typescript import for typed attributes from a different base directory', async () => {
    const definition = {
      models: {
        user: {
          attributes: {
            permission: { type: 'AttributeDefinition' }
          }
        }
      }
    }
    const types = generateTypes(new Schema(definition), {
      basePath: path.resolve(__dirname, '..')
    })
    expect(types).toContain(`import { AttributeDefinition } from "./types"`)
  })

  it('should generate attributes using the tsProperty option', async () => {
    const definition = {
      models: {
        user: {
          attributes: {
            username: { ts: 'AttributeDefinition' }
          }
        }
      }
    }
    const types = generateTypes(new Schema(definition as any), {
      tsProperty: 'ts'
    })
    expect(types).toContain(`import { AttributeDefinition } from "./src/types"`)
    expect(types).toContain(`username: AttributeDefinition`)
  })

  it('should generate attributes as any if ts type is not found', async () => {
    const definition = {
      models: {
        user: {
          attributes: {
            username: { type: 'UnknownInterface' }
          }
        }
      }
    }
    const types = generateTypes(new Schema(definition))
    expect(types).toContain(`username: any`)
  })

  it('should generate attributes as the regular type if ts type is not found', async () => {
    const definition = {
      models: {
        user: {
          attributes: {
            username: { type: 'string', ts: 'UnknownInterface' }
          }
        }
      }
    }
    const types = generateTypes(new Schema(definition), {
      tsProperty: 'ts'
    })
    expect(types).toContain(`username: string`)
  })
})
