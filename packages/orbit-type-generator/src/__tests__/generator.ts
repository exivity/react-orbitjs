import { Schema, SchemaSettings } from '@orbit/data'
import { generateTypes } from '../generator'

describe('generateTypes', () => {
  it('should generate the generic types', async () => {
    const definition: SchemaSettings = {
      models: {}
    }
    expect(generateTypes(new Schema(definition))).toContain(`GenericRecord`)
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
    expect(types).toContain(`UserModel`)
    expect(types).toContain(`UserAttributes`)
    expect(types).toContain(`username: string`)
    expect(types).not.toContain(`UserRelationships`)
  })

  it('should generate attributes as any if type if not set', async () => {
    const definition = {
      models: {
        user: {
          attributes: {
            username: {}
          }
        }
      }
    }
    expect(generateTypes(new Schema(definition))).toContain(`username: any`)
  })

  it('should generate relationships', async () => {
    const definition = {
      models: {
        user: {
          relationships: {
            group: { type: 'hasOne' },
            peers: { type: 'hasMany' }
          }
        }
      }
    } as const
    const types = generateTypes(new Schema(definition))
    expect(types).toContain(`UserModel`)
    expect(types).toContain(`UserRelationships`)
    expect(types).toContain(`group: RecordHasOneRelationship`)
    expect(types).toContain(`peers: RecordHasManyRelationship`)
    expect(types).not.toContain(`UserAttributes`)
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
    expect(types).toContain(`UserModel`)
    expect(types).toContain(`UserAttributes`)
    expect(types).toContain(`username: string`)
    expect(types).toContain(`UserRelationships`)
    expect(types).toContain(`group: RecordHasOneRelationship`)
  })

  it('should generate neither attributes and relationships', async () => {
    const definition = {
      models: {
        user: {}
      }
    } as const
    const types = generateTypes(new Schema(definition))
    expect(types).toContain(`UserModel`)
    expect(types).not.toContain(`UserAttributes`)
    expect(types).not.toContain(`UserRelationships`)
  })
})
