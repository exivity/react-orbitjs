import Store from "@orbit/store";
import { assert } from "@orbit/utils";

export function modelForRelationOf(dataStore: Store, type: string, relationship: string) {
    const model = dataStore.schema.models[type];

    assert(`model was not found for ${type}`, model !== undefined);

    const modelRelationship = model!.relationships![relationship];

    assert(`relationship ${relationship} was not found in model ${type}`, modelRelationship !== undefined);

    const relatedModel = modelRelationship.model;

    assert(`there is no model for the relationship ${relationship} on ${type}`, relatedModel !== undefined);

    return relatedModel;
}