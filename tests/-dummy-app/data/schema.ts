import { KeyMap, Schema, SchemaSettings } from '@orbit/data';

export const keyMap = new KeyMap();

const schemaDefinition: SchemaSettings = {
  models: {
    // https://accountjsonapi.docs.apiary.io/#reference/requests/request-collection/list-all
    request: {
      keys: { remoteId: {} },
      attributes: {
        type: { type: 'string' },
        email: { type: 'string' },
        expires: { type: 'string' },
      },
      relationships: {
      }
    },
  },
};

export const schema = new Schema(schemaDefinition);
