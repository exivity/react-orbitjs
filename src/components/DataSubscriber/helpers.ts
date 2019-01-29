import Store from "@orbit/store";
import { assert } from "@orbit/utils";

export function modelForRelationOf(dataStore: Store, type: string, relationship: string) {
    const model = modelOfType(dataStore, type);

    const modelRelationship = model!.relationships![relationship];

    assert(`relationship ${relationship} was not found in model ${type}`, modelRelationship !== undefined);

    const relatedModel = modelRelationship.model;

    assert(`there is no model for the relationship ${relationship} on ${type}`, relatedModel !== undefined);

    return relatedModel;
}

export function modelOfType(dataStore: Store, type: string) {
  const model = dataStore.schema.models[type];

  assert(`model was not found for ${type}`, model !== undefined);

  return model;
}

export function relationshipsForType(dataStore: Store, type: string) {
  const relationships = modelOfType(dataStore, type).relationships;

  return relationships || {};
}

export function areArraysShallowlyEqual<T>(a: T[], b: T[]): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let eachContainsAllValues = true;

  for(let i = 0; i < a.length; i++) {
    if (!b.includes(a[i])) {
      eachContainsAllValues = false;
      break;
    }
  }

  return eachContainsAllValues;
}