import { RecordIdentity } from '@orbit/data';
import { assert } from '@orbit/utils';
import Store from '@orbit/store';

export interface IBuildNewOptions<TAttrs, TRelationships> {
  attributes?: TAttrs;
  relationships?: TRelationships;
}

export interface IQueryOptions {
  include?: string[];
  fields?: { [key: string]: string[] | any };
  settings?: any;
}

interface IOrbitRemoteIdTracking {
  keys?: { remoteId: string };
}

type IRecordIdentity = RecordIdentity & IOrbitRemoteIdTracking;

export function localIdFromRecordIdentity(store: Store, recordIdentity: any) {
  const keyMap = store.keyMap;
  const { keys, type, id: maybeLocalId } = recordIdentity;

  if (keys) {
    return recordIdentity.id;
  }

  return keyMap.idFromKeys(type, { remoteId: maybeLocalId }) || recordIdentity.id;
}

// this should return the remoteId, always.
export function idFromRecordIdentity(store: Store, recordIdentity: IRecordIdentity): string {
  const keyMap = store.keyMap;
  const keys = recordIdentity.keys;

  if (!keys) {
    // what if id is still a local id? but there are no keys?
    const existingRemoteId = keyMap.idToKey(recordIdentity.type, 'remoteId', recordIdentity.id);

    return existingRemoteId || recordIdentity.id;
  }

  const remoteId = keys.remoteId;

  return remoteId || recordIdentity.id;
}

export function recordIdentityFrom(store: Store, id: string, type: string) {
  return recordIdentityFromKeys(store, { keys: { remoteId: id }, type });
}

export function remoteIdentityFrom(store: Store, resource: any) {
  if (!resource.keys) {
    // the returned id is a local id
    // resource id becomes the keys.remoteId
    return recordIdentityFrom(store, resource.id, resource.type);
  }

  return resource;
}

export interface IIdentityFromKeys {
  type?: string;
  id?: string;
  keys?: any;
}

export function recordIdentityFromKeys(store: Store, { type, id, keys }: IIdentityFromKeys) {
  assert(
    `type (${type}) and either id or keys must be specified`,
    type !== undefined && (id !== undefined || keys !== undefined)
  );

  const { keyMap, schema } = store;

  const recordIdentity: any = {
    type,
    keys: keys || { remoteId: keyMap.idToKey(type!, 'remoteId', id!) },
    id: id || keyMap.idFromKeys(type!, keys) || schema.generateId(type),
  };

  keyMap.pushRecord(recordIdentity);

  return recordIdentity;
}
