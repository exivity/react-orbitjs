import { KeyMap, Schema, SchemaSettings } from '@orbit/data';

export const keyMap = new KeyMap();

const schemaDefinition: SchemaSettings = {
  models: {
    // https://emberjs.com/api/ember/release
    project: {
      keys: { remoteId: {} },
      attributes: {
        githubUrl: { type: 'string' },
      },
      relationships: {
        projectVersions: { type: 'hasMany', model: 'projectVersion', inverse: 'project' },
      }
    },
    projectVersion: {
      keys: { remoteId: {} },
      attributes: {
        version: { type: 'string' },
      },
      relationships: {
        project: { type: 'hasOne', model: 'project', inverse: 'projectVersions' },
        // classes
        // modules
        // namespaces
        // private-classes
        // private-modules
        // private-namespaces
        // public-classes
        // public-modules
        // public-namespaces
      }
    }
  },
};

export const schema = new Schema(schemaDefinition);
