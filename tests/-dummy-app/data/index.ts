export {
  recordIdentityFrom,
  idFromRecordIdentity,
  localIdFromRecordIdentity,
  recordIdentityFromKeys,
} from './store-helpers';

export {
  attributesFor,
  idFor,
  relationshipsFor,
  hasRelationship,
  isRelatedTo,
  relationshipFor,
  firstError,
  isRelatedRecord,
  idsForRelationship,
  recordsWithIdIn,
} from './helpers';

export { schema, keyMap } from './schema';

export { withLoader } from './containers/with-loader';
export { withError } from './containers/with-error';

export { queryApi as query } from './query';

export { pushPayload } from './push-payload';

// TODO: change to 20, or remove.
//       currently, we don't have a way to see what the total
//       number of records or number of pages are in a request's payload.
//       Once we can read the total-records from the payload, we can
//       get rid of this entirely
export const TEMP_DEFAULT_PAGE_SIZE = 19;
