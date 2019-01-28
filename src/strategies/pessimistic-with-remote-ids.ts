import { Schema, KeyMap, Source } from '@orbit/data';
import Store from '@orbit/store';
import Coordinator, {
  SyncStrategy,
  RequestStrategy,
  EventLoggingStrategy,
} from '@orbit/coordinator';

import JSONAPISource, { JSONAPISerializer } from '@orbit/jsonapi';

export class RemoteIdJSONAPISerializer extends JSONAPISerializer {
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

export interface ICreateStoreOptions {
  logging?: boolean;
}

export interface ICreateStoreResult {
  sources: { [sourceName: string]: Source};
  store: Store;
}

export async function createStore(baseUrl: string, schema: Schema, keyMap: KeyMap, options: ICreateStoreOptions = {}): Promise<ICreateStoreResult> {
  const opts = {
    logging: false,
    ...options,
  };

  const inMemory = new Store({
    keyMap,
    schema,
    name: 'inMemory',
  });

  const remote = new JSONAPISource({
    keyMap,
    schema,
    name: 'remote',
    host: baseUrl,
    SerializerClass: RemoteIdJSONAPISerializer,
    defaultFetchSettings: {
      headers: {
        Accept: 'application/vnd.api+json',
        // these should be overwritten at runtime
        Authorization: 'Bearer not set',
      },
    },
  });

  // We don't want to have to query the API everytime we want data
  this.coordinator = new Coordinator({
    sources: [
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

      filter(query: any) {
        const options = (query || {}).options || {};
        const keep = !options.skipRemote;

        return keep;
      },

      catch(e: Error) {
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

      filter(query: any) {
        const options = (query || {}).options || {};
        const keep = !options.skipRemote;

        return keep;
      },

      catch(e: Error) {
        console.error('Could not push to remote', e);
        this.target.requestQueue.skip();
        this.source.requestQueue.skip();

        throw e;
      },
    })
  );

  if (opts.logging) {
    this.coordinator.addStrategy(new EventLoggingStrategy({
      sources: ['remote', 'inMemory']
    }));  
  }


  // sync all remote changes with the inMemory store
  this.coordinator.addStrategy(
    new SyncStrategy({
      source: 'remote',
      target: 'inMemory',
      blocking: true,
    })
  );

  await this.coordinator.activate();

  return { store: inMemory, sources: { remote, inMemory }, };
}
