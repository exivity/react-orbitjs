import Store from '@orbit/store';
import { QueryBuilder, QueryOrExpression } from '@orbit/data';

import {
  idFromRecordIdentity,
  localIdFromRecordIdentity,
  IIdentityFromKeys,
  modelNameFromRelationship,
} from 'react-orbitjs/utils';

type IJsonApiPayload<TType extends string, TAttrs extends AttributesObject> =
  | SingleResourceDoc<TType, TAttrs>
  | ResourceObject<TType, TAttrs>;

export function attributesFor<TType extends string, TAttrs extends AttributesObject>(
  payload: IJsonApiPayload<TType, TAttrs>
): TAttrs {
  if (!payload) {
    return {} as TAttrs;
  }

  const data = (payload as SingleResourceDoc<TType, TAttrs>).data;

  if (data) {
    return attributesFor(data);
  }

  const attributes = (payload as ResourceObject<TType, TAttrs>).attributes;

  return (attributes || {}) as TAttrs;
}

export function idFor(payload: any): string {
  if (payload.data) {
    return idFor(payload.data);
  }

  return payload.id;
}

export function idsForRelationship(collection, relationshipName) {
  const localIds = collection
    .map((record) => {
      const relationData = relationshipFor(record, relationshipName).data;

      if (!relationData) {
        return;
      }

      return localIdFromRecordIdentity(relationData);
    })
    .filter((id) => id);

  return localIds;
}

export function recordsWithIdIn(collection, ids) {
  return collection.filter((record) => ids.includes(record.id));
}

export function relationshipsFor<TType extends string, TAttrs extends AttributesObject>(
  payload: IJsonApiPayload<TType, TAttrs>
): RelationshipsObject {
  if (!payload) {
    return {};
  }

  const data = (payload as SingleResourceDoc<TType, TAttrs>).data;

  if (data) {
    return relationshipsFor(data);
  }

  const relationships = (payload as ResourceObject<TType, TAttrs>).relationships;

  return relationships || {};
}

export function hasRelationship(payload, name: string): boolean {
  const filtered = relationshipFor(payload, name);
  const data = (filtered.data || []) as any[];

  return data.length > 0;
}

export function relationshipFor(payload: any, relationshipName: string): RelationshipsWithData {
  const relationships = relationshipsFor(payload);
  const relation = relationships[relationshipName] || {};

  return relation as RelationshipsWithData;
}

export function isRelatedTo(payload: any, relationshipName: string, id: string): boolean {
  const relation = relationshipFor(payload, relationshipName);
  const relationData = relation.data || ({} as ResourceLinkage);

  if (Array.isArray(relationData)) {
    return !!relationData.find((r) => {
      return r.id === id || idFromRecordIdentity(r) === id;
    });
  }

  return relationData.id === id || idFromRecordIdentity(relationData) === id;
}

export function isRelatedRecord<TType extends string = ''>(
  payload: any,
  record: ResourceObject<TType>
) {
  const id = idFromRecordIdentity<TType>(record as any);

  return isRelatedTo(payload, record.type, id) || isRelatedTo(payload, record.type, record.id);
}

// NOTE:
//   this function is pretty much 'filter'
//   but hides the relational logic behind the filter.
//   since a lot of logic in the app has to do with
//   many-to-many / many-through-something-has-many relationships
//   this function should be used to ensure that no extra data in the cache
//   bleeds through what is intended to be seen.
//
// through is camelCase, and represents a relationship
//
// NOTE: this is a work in progress
// TODO: finish this
export async function cachedWithRelationThrough(
  store: Store,
  query: QueryOrExpression,
  throughRelationshipName: string,
  to: IIdentityFromKeys
) {
  const cacheResultsFromQuery = await store.cache.query(query);
  // if something doesn't have attributes, it hasn't been fetched from the remote
  const cacheResults = cacheResultsFromQuery.filter((r) => r.attributes);

  if (cacheResults.length === 0) {
    return [];
  }

  const throughModelName = modelNameFromRelationship(cacheResults[0], throughRelationshipName);
  const modelname = cacheResults[0].type;
  const targetModelName = to.type;
  // const joiningRelationName = inverseRelationshipOf(throughModelName, joiningRelationName);

  const results: any = [];

  const filterPromise = cacheResults.map(async (cacheResult) => {
    const relation = relationshipFor(cacheResult, throughRelationshipName);
    const { data: relationData } = relation;

    if (!relationData) {
      return false;
    }

    const joinRecords = await store.cache.query((q) =>
      q.findRelatedRecords(cacheResult, throughModelName)
    );

    if (joinRecords.length === 0) {
      return [];
    }

    // TODO: make this lookup the other side of the relationship in case the
    //       relationship name does not match the model name / type
    const joinPromises = joinRecords.map((joinRecord) => {
      const isRelated = isRelatedRecord(joinRecord, to as any);

      if (isRelated) {
        results.push(cacheResult);
      }
    });
  });

  await Promise.all(filterPromise);

  return results;
}

export function firstError(json): ErrorObject {
  if (!json || !json.errors) {
    return {};
  }

  const errors = json.errors || [];
  const first = errors[0];

  return first || {};
}
