import { schema, keyMap } from './schema';
import { recordIdentityFrom } from './store-helpers';
import Store from '@orbit/store';
import { JSONAPISerializer } from '@orbit/jsonapi';

// NOTE: more may be added here
export enum PAYLOAD_OPERATION {
  ADD_RECORD = 'addRecord',
  REPLACE_RECORD = 'replaceRecord',
}

// TODO: payload should be a valid `{ json:api }` payload
export async function pushPayload(store: Store, payload: any, op = PAYLOAD_OPERATION.ADD_RECORD) {
  const serializer = new JSONAPISerializer({ schema: store.schema, keyMap: store.keyMap });
  const normalized = serializer.deserializeDocument(payload);

  const datas = buildDatas(normalized);
  const included = buildIncluded(normalized);
  const resources = datas.concat(included);

  fixRelationships(resources);
  assignIdsToResources(resources);

  // TODO: verify that this pushes to cache instead across the network
  await store.update(
    (q) =>
      resources.map((resource) => {
        return q[op](resource);
      }),
    { skipRemote: true }
  );
}

function buildIncluded(normalized: any) {
  const included = normalized.included || [];

  return included;
}

function buildDatas(normalized: any) {
  const data = normalized.data;
  const records = Array.isArray(data) ? data : [data];

  return records;
}

function fixRelationships(resources: any[]) {
  resources.forEach((resource) => {
    Object.keys(resource.relationships || {}).forEach((relationName) => {
      const relation = resource.relationships[relationName] || {};

      if (!relation.data) {
        relation.data = [];
      }

      const isHasMany = Array.isArray(relation.data);
      const datas = isHasMany ? relation.data : [relation.data];

      datas.forEach((d: any) => {
        const recordIdentity = recordIdentityFrom(d.id, d.type);
        const localId = recordIdentity.id;

        d.id = localId;
      });
    });
  });
}

function assignIdsToResources(resources: any[]) {
  resources.forEach(assignIds);
}

function assignIds(resource: any) {
  resource.keys = { remoteId: resource.id };
  resource.id = keyMap.idFromKeys(resource.type, resource.keys) || schema.generateId(resource.type);
}
