
import { schema, keyMap } from './schema';
import { RecordIdentity } from '@orbit/data';
import { assert } from '@orbit/utils';

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

export function localIdFromRecordIdentity(recordIdentity: any) {
  const { keys, type, id: maybeLocalId } = recordIdentity;

  if (keys) {
    return recordIdentity.id;
  }

  return keyMap.idFromKeys(type, { remoteId: maybeLocalId }) || recordIdentity.id;
}

// this should return the remoteId, always.
export function idFromRecordIdentity(recordIdentity: IRecordIdentity): string {
  const keys = recordIdentity.keys;

  if (!keys) {
    // what if id is still a local id? but there are no keys?
    const existingRemoteId = keyMap.idToKey(recordIdentity.type, 'remoteId', recordIdentity.id);

    return existingRemoteId || recordIdentity.id;
  }

  const remoteId = keys.remoteId;

  return remoteId || recordIdentity.id;
}

export function recordIdentityFrom(id: string, type: string) {
  return recordIdentityFromKeys({ keys: { remoteId: id }, type });
}

export function remoteIdentityFrom(resource: any) {
  if (!resource.keys) {
    // the returned id is a local id
    // resource id becomes the keys.remoteId
    return recordIdentityFrom(resource.id, resource.type);
  }

  return resource;
}

export interface IIdentityFromKeys {
  type?: string;
  id?: string;
  keys?: any;
}

export function recordIdentityFromKeys({ type, id, keys }: IIdentityFromKeys) {
  assert(`type (${type}) and id (${id}) must be specified`, type !== undefined && id !== undefined);

  const recordIdentity: any = {
    type,
    keys: keys || { remoteId: keyMap.idToKey(type!, 'remoteId', id!) },
    id: id || keyMap.idFromKeys(type!, keys) || schema.generateId(type),
  };

  keyMap.pushRecord(recordIdentity);

  return recordIdentity;
}
