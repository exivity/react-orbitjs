import ts = require('typescript')
import path = require('path')
import fs = require('fs')
import slash = require('slash')
import { Schema, RelationshipDefinition } from '@orbit/data'
import { Dict } from '@orbit/utils'
import { getTemplate, toPascalCase } from './utils'
import {
  ModelDefinition,
  AttributeDefinition,
  ImportDeclaration
} from './types'
import { resolveType } from './typeResolver'

let dynamicImports

interface GenerateTypesOptions {
  basePath?: string
  extraImports?: ImportDeclaration[]
}

export function generateTypes (
  schema: Schema,
  options: GenerateTypesOptions = {}
) {
  const extraImports = options.extraImports || []
  const basePath = options.basePath || process.cwd()

  // Reset dynamic imports
  dynamicImports = []

  // We need to call generateRecordTypes first so import can be added dynamically.
  const recordTypes = generateRecordTypes(schema.models)
  const statements = [
    generateHeader(),
    generateImports(basePath, [...dynamicImports, ...extraImports]),
    recordTypes
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

function generateHeader () {
  return getTemplate('header')
}

function generateImports (basePath: string, imports?: ImportDeclaration[]) {
  if (!imports || !imports.length) {
    return ''
  }

  const pipe = (...functions: Function[]) => <T>(args: T) =>
    functions.reduce<T>((arg, fn) => fn(arg), args)
  const resolvePath = (modulePath: string) =>
    require.resolve(modulePath, { paths: [basePath] })
  const validatePath = (modulePath: string) => {
    if (!fs.existsSync(modulePath)) {
      throw new Error(`Not a valid module path: ${modulePath}`)
    }
    return modulePath
  }
  const toRelativePaths = (modulePath: string) =>
    path.relative(basePath, modulePath)
  const toForwardSlash = (modulePath: string) => slash(modulePath)
  const stripExtension = (modulePath: string) =>
    modulePath
      .split('.')
      .slice(0, -1)
      .join('.')
  const addDotSlash = (modulePath: string) => `./${modulePath}`

  function transform ({ modulePath, ...rest }: ImportDeclaration) {
    return {
      modulePath: pipe(
        resolvePath,
        validatePath,
        toRelativePaths,
        toForwardSlash,
        stripExtension,
        addDotSlash
      )(modulePath),
      ...rest
    }
  }

  function combine (
    newDeclarations: ImportDeclaration[],
    declaration: ImportDeclaration
  ) {
    const existingModuleIndex = newDeclarations.findIndex(
      ({ modulePath }) => modulePath === declaration.modulePath
    )

    if (existingModuleIndex > -1) {
      newDeclarations[existingModuleIndex] = {
        type: `${newDeclarations[existingModuleIndex].type}, ${
          declaration.type
        }`,
        modulePath: declaration.modulePath
      }
    } else {
      newDeclarations.push(declaration)
    }

    return newDeclarations
  }

  return imports
    .map(transform)
    .reduce(combine, [])
    .map(({ type, modulePath }) => getTemplate('import', [type, modulePath]))
    .join('\n')
}

function addTypeToImports (type: string) {
  const resolved = resolveType(type)

  if (resolved) {
    dynamicImports.push(resolved)
  }
}

function generateRecordTypes (models: Schema['models']) {
  return Object.entries(models)
    .map(([name, definition]) => {
      return generateRecordType(name, definition)
    })
    .join('\n')
}

function generateRecordType (name: string, definition: ModelDefinition) {
  let attributesIdentifier = 'undefined'
  let relationshipIdentifier = 'undefined'
  let attributes = ''
  let relationships = ''

  if (definition.attributes) {
    attributes = generateAttributes(name, definition.attributes)
    attributesIdentifier = `${toPascalCase(name)}Attributes`
  }

  if (definition.relationships) {
    relationships = generateRelationships(name, definition.relationships)
    relationshipIdentifier = `${toPascalCase(name)}Relationships`
  }

  const model = getTemplate('record', [
    toPascalCase(name),
    toPascalCase(name),
    attributesIdentifier,
    relationshipIdentifier
  ])

  const identity = generateIdentity(name)

  return [model, identity, attributes, relationships].join('\n')
}

function generateIdentity (name: string) {
  return getTemplate('identity', [toPascalCase(name), name])
}

function generateAttributes (
  name: string,
  attributes: Dict<AttributeDefinition>
) {
  const attributeList = Object.entries(attributes)
    .map(([name, definition]) => {
      let type
      if (definition.ts) {
        type = definition.ts
        addTypeToImports(type)
      } else {
        switch (definition.type) {
          case 'string':
            type = 'string'
            break
          case 'float':
          case 'integer':
          case 'number':
          case 'numeric':
            type = 'number'
            break
          default:
            type = 'any'
        }
      }
      return `${name}: ${type}`
    })
    .join('\n')

  return getTemplate('attributes', [toPascalCase(name), attributeList])
}

function generateRelationships (
  name: string,
  relationships: Dict<RelationshipDefinition>
) {
  const relationshipList = Object.entries(relationships)
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

  return getTemplate('relationships', [toPascalCase(name), relationshipList])
}
