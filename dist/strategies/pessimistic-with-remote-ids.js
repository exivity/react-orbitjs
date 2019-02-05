"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const store_1 = require("@orbit/store");
const coordinator_1 = require("@orbit/coordinator");
const jsonapi_1 = require("@orbit/jsonapi");
class RemoteIdJSONAPISerializer extends jsonapi_1.JSONAPISerializer {
    // remoteId is used to track the difference between local ids and the
    // real id of the server.  This is done so that orbit can maintain
    // relationships before persisting them to the remote host.
    // (before persisting, there are no known ids)
    //
    // resourceKey just defines what local key is used for the id
    // received from the server
    //
    // remoteIds will be set when the JSONAPISource receives records
    resourceKey(type) {
        return 'remoteId';
    }
}
exports.RemoteIdJSONAPISerializer = RemoteIdJSONAPISerializer;
function createStore(baseUrl, schema, keyMap, options = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        const opts = Object.assign({ logging: false }, options);
        const inMemory = new store_1.default({
            keyMap,
            schema,
            name: 'inMemory',
        });
        const remote = new jsonapi_1.default({
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
        const coordinator = new coordinator_1.default({
            sources: [inMemory, remote],
        });
        // TODO: when there is a network error:
        // https://github.com/dgeb/test-ember-orbit/blob/master/app/data-strategies/remote-push-fail.js
        // Pull query results from the server
        coordinator.addStrategy(new coordinator_1.RequestStrategy({
            name: 'inMemory-remote-query-pessimistic',
            source: 'inMemory',
            on: 'beforeQuery',
            target: 'remote',
            action: 'pull',
            blocking: true,
            filter(query) {
                const options = (query || {}).options || {};
                const keep = !options.skipRemote;
                return keep;
            },
            catch(e) {
                this.target.requestQueue.skip();
                this.source.requestQueue.skip();
                throw e;
            },
        }));
        // Push updates to the server
        coordinator.addStrategy(new coordinator_1.RequestStrategy({
            name: 'inMemory-remote-update-pessimistic',
            source: 'inMemory',
            on: 'beforeUpdate',
            target: 'remote',
            action: 'push',
            blocking: true,
            filter(query) {
                const options = (query || {}).options || {};
                const keep = !options.skipRemote;
                return keep;
            },
            catch(e) {
                this.target.requestQueue.skip();
                this.source.requestQueue.skip();
                throw e;
            },
        }));
        if (opts.logging) {
            coordinator.addStrategy(new coordinator_1.EventLoggingStrategy({
                sources: ['remote', 'inMemory'],
            }));
        }
        // sync all remote changes with the inMemory store
        coordinator.addStrategy(new coordinator_1.SyncStrategy({
            source: 'remote',
            target: 'inMemory',
            blocking: true,
        }));
        yield coordinator.activate();
        return { store: inMemory, sources: { remote, inMemory }, coordinator };
    });
}
exports.createStore = createStore;
