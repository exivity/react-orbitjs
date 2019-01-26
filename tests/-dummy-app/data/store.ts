import { Bucket } from '@orbit/core';
import Orbit, { Source } from '@orbit/data';
import Store from '@orbit/store';
import LocalStorageBucket from '@orbit/local-storage-bucket';
import IndexedDBBucket, { supportsIndexedDB } from '@orbit/indexeddb-bucket';
import Coordinator, {
  SyncStrategy,
  RequestStrategy,
  EventLoggingStrategy,
} from '@orbit/coordinator';
import JSONAPISource, { JSONAPISerializer } from '@orbit/jsonapi';
import IndexedDBSource from '@orbit/indexeddb';

import { schema, keyMap } from './schema';

const BucketClass = supportsIndexedDB ? IndexedDBBucket : LocalStorageBucket;

class CustomJSONAPISerializer extends JSONAPISerializer {
  // remoteId is used to track the difference between local ids and the
  // real id of the server.  This is done so that orbit can maintain
  // relationships before persisting them to the remote host.
  // (before persisting, there are no known ids)
  //
  // resourceKey just defines what local key is used for the id
  // received from the server
  //
  // remoteIds will be set when the JSONAPISource receives records
  resourceKey(type: string) {
    return 'remoteId';
  }
}

export const serializer = new JSONAPISerializer({ schema, keyMap });

export async function createStore() {
  // const bucket = new BucketClass({ namespace: 'scriptoria-bucket' });
  const inMemory = new Store({
    // bucket,
    keyMap,
    schema,
    name: 'inMemory',
  });

  const remote = new JSONAPISource({
    keyMap,
    schema,
    name: 'remote',
    host: 'https://emberjs.com/api/ember/release',
    SerializerClass: CustomJSONAPISerializer,
    defaultFetchSettings: {
      headers: {
        Accept: 'application/vnd.api+json',
        // these should be overwritten at runtime
        Authorization: 'Bearer not set',
        // Do not have a default Organization header here.
        // The Project directory needs this header to not be present
      },
    },
  });

  // For later when we want to persist between refreshes
  // or queue offline things
  // const backup = new IndexedDBSource({
  //   keyMap,
  //   bucket,
  //   schema,
  //   name: 'backup',
  //   namespace: 'scriptoria'
  // });

  // We don't want to have to query the API everytime we want data
  this.coordinator = new Coordinator({
    sources: [
      // backup,
      inMemory,
      remote,
    ],
  });

  // TODO: when there is a network error:
  // https://github.com/dgeb/test-ember-orbit/blob/master/app/data-strategies/remote-push-fail.js

  // Pull query results from the server
  this.coordinator.addStrategy(
    new RequestStrategy({
      name: 'inMemory-remote-query-pessimistic',
      source: 'inMemory',
      on: 'beforeQuery',
      target: 'remote',
      action: 'pull',
      blocking: true,

      filter(query) {
        const options = (query || {}).options || {};
        const keep = !(options.devOnly || options.skipRemote);

        return keep;
      },

      catch(e) {
        console.error('Could not pull from remote', e);
        this.target.requestQueue.skip();
        this.source.requestQueue.skip();

        throw e;
      },
    })
  );

  // Push updates to the server
  this.coordinator.addStrategy(
    new RequestStrategy({
      name: 'inMemory-remote-update-pessimistic',
      source: 'inMemory',
      on: 'beforeUpdate',
      target: 'remote',
      action: 'push',
      blocking: true,

      filter(query) {
        const options = (query || {}).options || {};
        const keep = !(options.devOnly || options.skipRemote);

        return keep;
      },

      catch(e) {
        console.error('Could not push to remote', e);
        this.target.requestQueue.skip();
        this.source.requestQueue.skip();

        throw e;
      },
    })
  );

  // sync all remote changes with the inMemory store
  this.coordinator.addStrategy(
    new SyncStrategy({
      source: 'remote',
      target: 'inMemory',
      blocking: true,
    })
  );

  // this.coordinator.addStrategy(new SyncStrategy({
  //   source: 'inMemory',
  //   target: 'backup',
  //   blocking: true
  // }));

  // this.coordinator.addStrategy(new EventLoggingStrategy({
  //   sources: ['remote', 'inMemory']
  //   // sources: ['inMemory']
  // }));

  // // If there is data already stored locally, throw it in memory
  // backup.pull(q => q.findRecords())
  //   .then(transform => {
  //     console.log(transform);
  //     return inMemory.sync(transform)
  //   })
  //   .then(() => this.coordinator.activate());

  await this.coordinator.activate();

  return { store: inMemory, sources: { remote, inMemory } };
}
