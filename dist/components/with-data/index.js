"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const getDisplayName_1 = require("./-utils/getDisplayName");
const orbit_context_1 = require("../orbit-context");
const subscriber_1 = require("./subscriber");
const defaultOptions = {
    label: '',
};
function withData(mapRecordsToProps, passedOptions) {
    const options = Object.assign({}, defaultOptions, (passedOptions || {}));
    const mapRecords = mapRecordsToProps || {};
    let mapRecordsFunction;
    if (typeof mapRecords === 'function') {
        mapRecordsFunction = mapRecords;
    }
    else {
        mapRecordsFunction = () => mapRecords;
    }
    return (WrappedComponent) => {
        var _a;
        const ConnectedSubscription = subscriber_1.withDataSubscription(mapRecordsFunction, options)(WrappedComponent);
        return _a = class WithOrbit extends React.Component {
                render() {
                    return (React.createElement(orbit_context_1.OrbitContext.Consumer, null, (dataProps) => {
                        return React.createElement(ConnectedSubscription, Object.assign({}, this.props, dataProps));
                    }));
                }
            },
            _a.displayName = `WithOrbitData:${options.label}(${getDisplayName_1.getDisplayName(WrappedComponent)})`,
            _a;
    };
}
exports.withData = withData;
exports.withOrbit = withData;
