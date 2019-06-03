import {
  AttributeDefinition as OriginalAttributeDefinition,
  ModelDefinition as OriginalModelDefinition,
  KeyDefinition,
  RelationshipDefinition
} from '@orbit/data'
import { Dict } from '@orbit/utils'

export interface AttributeDefinition extends OriginalAttributeDefinition {
  ts?: string
}

export interface ModelDefinition extends OriginalModelDefinition {
  keys?: Dict<KeyDefinition>
  attributes?: Dict<AttributeDefinition>
  relationships?: Dict<RelationshipDefinition>
}

export interface ImportDeclaration {
  type: string
  modulePath: string
}
