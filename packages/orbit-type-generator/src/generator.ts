import ts = require('typescript')
import camelCase = require('camelcase')
import {
  Schema,
  ModelDefinition,
  AttributeDefinition,
  RelationshipDefinition
} from '@orbit/data'
import { Dict } from '@orbit/utils'

export function generateTypes (schema: Schema) {
  const statements = [
    generateImports(),
    generateGenericTypes(),
    generateModelTypes(schema.models)
  ]
  const resultFile = ts.createSourceFile(
    'records.d.ts',
    statements.join(''),
    ts.ScriptTarget.Latest,
    false,
    ts.ScriptKind.TS
  )
  const printer = ts.createPrinter({
    newLine: ts.NewLineKind.LineFeed
  })
  const out = printer.printFile(resultFile)

  return out
}

function generateImports () {
  return `import { Record, RecordRelationship, RecordHasManyRelationship, RecordHasOneRelationship } from '@orbit/data'
import { Dict } from '@orbit/utils'`
}

function generateGenericTypes () {
  return `interface GenericRecord<
  A extends Dict<any> | undefined = undefined,
  R extends Dict<RecordRelationship> | undefined = undefined
> extends Record {
  attributes?: A
  relationships?: R
}`
}

function generateModelTypes (models: Schema['models']) {
  return Object.entries(models)
    .map(([name, definition]) => {
      const namePascalCase = camelCase(name, { pascalCase: true })
      return generateModelType(namePascalCase, definition)
    })
    .join('\n')
}

function generateModelType (name: string, definition: ModelDefinition) {
  let attributesIdentifier = 'undefined'
  let relationshipIdentifier = 'undefined'
  let out = ''

  if (definition.attributes) {
    out += generateModelAttributes(name, definition.attributes)
    attributesIdentifier = `${name}Attributes`
  }

  if (definition.relationships) {
    out += generateModelRelationships(name, definition.relationships)
    relationshipIdentifier = `${name}Relationships`
  }

  return (out += `export type ${name}Model = GenericRecord<${attributesIdentifier}, ${relationshipIdentifier}>`)
}

function generateModelAttributes (
  name: string,
  attributes: Dict<AttributeDefinition>
) {
  let out = `export interface ${name}Attributes {`

  out += Object.entries(attributes)
    .map(([name, definition]) => {
      let type
      switch (definition.type) {
        default:
          type =
            typeof definition.type === 'undefined' ? 'any' : definition.type
      }
      return `${name}: ${type}`
    })
    .join('\n')

  return (out += `}`)
}

function generateModelRelationships (
  name: string,
  relationships: Dict<RelationshipDefinition>
) {
  let out = `export interface ${name}Relationships extends Dict<RecordRelationship> {`

  out += Object.entries(relationships)
    .map(([name, definition]) => {
      let type
      switch (definition.type) {
        case 'hasOne':
          type = 'RecordHasOneRelationship'
          break
        case 'hasMany':
          type = 'RecordHasManyRelationship'
          break
      }
      return `${name}: ${type}`
    })
    .join('\n')

  return (out += `}`)
}
