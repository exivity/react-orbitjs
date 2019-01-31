"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_1 = require("@orbit/data");
const getFirstJSONAPIError = (error) => {
    return (error.data && error.data.errors && error.data.errors.length > 0 && error.data.errors[0].detail);
};
function parseError(error) {
    if (error instanceof data_1.RecordNotFoundException) {
        return {
            title: error.description,
            body: error.message,
        };
    }
    if (error instanceof data_1.ClientError) {
        return {
            title: error.description,
            body: error.message,
        };
    }
    const jsonApiError = getFirstJSONAPIError(error);
    if (jsonApiError) {
        return { title: jsonApiError };
    }
    const title = error.message || error;
    const body = undefined;
    return { title, body };
}
exports.parseError = parseError;
