"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const parse_error_1 = require("./parse-error");
class ErrorMessage extends React.Component {
    render() {
        const { error } = this.props;
        if (!error || error.length === 0) {
            return null;
        }
        // title is required, but body is not.
        const { title, body } = parse_error_1.parseError(error);
        return (React.createElement("div", { className: 'react-orbitjs__error-message-wrapper' },
            React.createElement("div", { className: 'react-orbitjs__error-message-title' }, title),
            (body && React.createElement("p", { className: 'react-orbitjs__error-message-body' }, body)) || null));
    }
}
exports.default = ErrorMessage;
