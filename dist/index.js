"use strict";
// NOTE: for legacy reasons / compatibility with upstream,
//       all the data* names need to be maintained
//       a major version update will remove those in favor of
//       - OrbitProvider
//       - withOrbit
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var data_provider_1 = require("./components/data-provider");
exports.OrbitProvider = data_provider_1.OrbitProvider;
exports.DataProvider = data_provider_1.DataProvider;
var api_provider_1 = require("./components/api-provider");
exports.APIProvider = api_provider_1.APIProvider;
var with_data_1 = require("./components/with-data");
exports.withOrbit = with_data_1.withOrbit;
exports.withData = with_data_1.withData;
var query_1 = require("./components/query");
exports.query = query_1.query;
var strategies_1 = require("./strategies");
exports.strategies = strategies_1.default;
// TODO: why can't I import from subdirectories in the built package?
__export(require("./components/errors"));
__export(require("./utils"));
