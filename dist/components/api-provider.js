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
const React = require("react");
const react_orbitjs_1 = require("react-orbitjs");
// TODO: pull this in to the library
class APIProvider extends React.Component {
    constructor(props) {
        super(props);
        this.state = { store: undefined, sources: undefined };
        this.initDataStore.bind(this)();
    }
    initDataStore() {
        return __awaiter(this, void 0, void 0, function* () {
            const { store, sources } = yield this.props.storeCreator();
            this.setState({ store, sources });
        });
    }
    render() {
        const { store, sources } = this.state;
        if (!store || !sources) {
            return null;
        }
        return (React.createElement(react_orbitjs_1.DataProvider, { dataStore: store, sources: sources }, this.props.children));
    }
}
exports.APIProvider = APIProvider;
