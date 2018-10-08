"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = withData;

var _propTypes = require("prop-types");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require("react");

var _dataStoreShape = require("../utils/dataStoreShape");

var _dataStoreShape2 = _interopRequireDefault(_dataStoreShape);

var _shallowEqual = require("../utils/shallowEqual");

var _shallowEqual2 = _interopRequireDefault(_shallowEqual);

var _hoistNonReactStatics = require("hoist-non-react-statics");

var _hoistNonReactStatics2 = _interopRequireDefault(_hoistNonReactStatics);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var defaultMapRecordsToProps = {};
var defaultMergeProps = function defaultMergeProps(recordProps, parentProps) {
  return _extends({}, parentProps, recordProps);
};

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || "Component";
}

function withData(mapRecordsToProps, mergeProps) {
  var shouldSubscribe = Boolean(mapRecordsToProps);

  var mapRecords = mapRecordsToProps || defaultMapRecordsToProps;
  var finalMergeProps = mergeProps || defaultMergeProps;

  return function wrapWithConnect(WrappedComponent) {
    var componentDisplayName = "WithData(" + getDisplayName(WrappedComponent) + ")";

    function computeMergedProps(stateProps, parentProps) {
      return finalMergeProps(stateProps, parentProps);
    }

    var WithData = function (_Component) {
      _inherits(WithData, _Component);

      _createClass(WithData, [{
        key: "shouldComponentUpdate",
        value: function shouldComponentUpdate() {
          return this.haveOwnPropsChanged || this.hasDataStoreChanged;
        }
      }]);

      function WithData(props, context) {
        _classCallCheck(this, WithData);

        var _this = _possibleConstructorReturn(this, (WithData.__proto__ || Object.getPrototypeOf(WithData)).call(this, props, context));

        _initialiseProps.call(_this);

        _this.dataStore = props.dataStore || context.dataStore;
        _this.sources = props.sources || context.sources;

        if (!_this.dataStore) {
          throw new Error("Could not find \"dataStore\" in either the context or " + ("props of \"" + componentDisplayName + "\". ") + "Either wrap the root component in a <DataProvider>, " + ("or explicitly pass \"dataStore\" as a prop to \"" + componentDisplayName + "\"."));
        }

        // const storeState = this.dataStore.getState()
        // this.state = {storeState}
        _this.clearCache();
        return _this;
      }

      _createClass(WithData, [{
        key: "componentDidMount",
        value: function componentDidMount() {
          this.trySubscribe();
        }
      }, {
        key: "componentWillReceiveProps",
        value: function componentWillReceiveProps(nextProps) {
          if (!(0, _shallowEqual2.default)(nextProps, this.props)) {
            this.haveOwnPropsChanged = true;
          }
        }
      }, {
        key: "componentWillUnmount",
        value: function componentWillUnmount() {
          this.tryUnsubscribe();
          this.clearCache();
        }
      }, {
        key: "render",
        value: function render() {
          var haveOwnPropsChanged = this.haveOwnPropsChanged,
              hasDataStoreChanged = this.hasDataStoreChanged,
              renderedElement = this.renderedElement;


          var shouldUpdateRecordProps = true;
          if (renderedElement) {
            shouldUpdateRecordProps = hasDataStoreChanged || haveOwnPropsChanged && this.doRecordPropsDependOnOwnProps;
          }

          var haveRecordPropsChanged = false;
          if (shouldUpdateRecordProps) {
            haveRecordPropsChanged = this.updateRecordPropsIfNeeded();
          }

          this.haveOwnPropsChanged = false;
          this.hasDataStoreChanged = false;
          this.dataStoreChangedProps = [];

          var haveMergedPropsChanged = true;
          if (haveRecordPropsChanged || haveOwnPropsChanged) {
            haveMergedPropsChanged = this.updateMergedPropsIfNeeded();
          } else {
            haveMergedPropsChanged = false;
          }

          if (!haveMergedPropsChanged && renderedElement) {
            return renderedElement;
          }

          this.renderedElement = (0, _react.createElement)(WrappedComponent, this.mergedProps);

          return this.renderedElement;
        }
      }]);

      return WithData;
    }(_react.Component);

    var _initialiseProps = function _initialiseProps() {
      var _this2 = this;

      this.computeChangedRecordProps = function (selectedRecordProps, dataStore, props) {
        return _this2.selectivelyComputeRecordProps(selectedRecordProps, dataStore, props);
      };

      this.computeAllRecordProps = function (dataStore, props) {
        return _this2.selectivelyComputeRecordProps(true, dataStore, props);
      };

      this.selectivelyComputeRecordProps = function (selectedRecordPropsOrAll, dataStore, props) {
        var recordQueries = void 0;

        if (selectedRecordPropsOrAll === true || selectedRecordPropsOrAll.length) {
          recordQueries = _this2.getRecordQueries(dataStore, props);
        }

        if (selectedRecordPropsOrAll === true) {
          selectedRecordPropsOrAll = Object.keys(recordQueries);
        }

        var recordProps = {};

        selectedRecordPropsOrAll.forEach(function (prop) {
          try {
            recordProps[prop] = dataStore.cache.query(recordQueries[prop]);
          } catch (error) {
            console.warn(error.message);
            recordProps[prop] = undefined;
          }
        });

        return recordProps;
      };

      this.getConvenienceProps = function (dataStore, sources) {
        if (!_this2.convenienceProps) {
          _this2.convenienceProps = {
            queryStore: function queryStore() {
              return dataStore.query.apply(dataStore, arguments);
            },
            updateStore: function updateStore() {
              return dataStore.update.apply(dataStore, arguments);
            },
            dataStore: dataStore,
            sources: sources
          };
        }

        return _this2.convenienceProps;
      };

      this.getRecordQueries = function (dataStore, props) {
        if (!_this2.mapRecordsIsConfigured || _this2.doRecordPropsDependOnOwnProps && _this2.haveOwnPropsChanged) {
          return _this2.configureMapRecords(dataStore, props);
        }

        return _this2.mapRecordsGivenOwnProps(props);
      };

      this.mapRecordsGivenOwnProps = function (props) {
        return _this2.recordPropsIsFunction ? mapRecords(props) : mapRecords;
      };

      this.configureMapRecords = function (dataStore, props) {
        _this2.recordPropsIsFunction = typeof mapRecords === "function";
        _this2.doRecordPropsDependOnOwnProps = _this2.recordPropsIsFunction && mapRecords.length > 0;
        _this2.mapRecordsIsConfigured = true;

        var recordQueries = _this2.mapRecordsGivenOwnProps(props);
        var recordQueryKeys = Object.keys(recordQueries);

        recordQueryKeys.forEach(function (prop) {
          return _this2.subscribedModels[prop] = [];
        });

        // Iterate all queries, to make a list of models to listen for
        recordQueryKeys.forEach(function (prop) {
          var expression = recordQueries[prop](dataStore.queryBuilder).expression;

          switch (expression.op) {
            case "findRecord":
              _this2.subscribedModels[prop].push(expression.record.type);
              break;

            case "findRecords":
              _this2.subscribedModels[prop].push(expression.type);
              break;

            case "findRelatedRecord":
            case "findRelatedRecords":
              _this2.subscribedModels[prop].push(expression.record.type);
              _this2.subscribedModels[prop].push(_this2.dataStore.schema.models[expression.record.type].relationships[expression.relationship].model);
          }
        });

        recordQueryKeys.forEach(function (prop) {
          _this2.subscribedModels[prop] = _this2.subscribedModels[prop].filter(function (value, index, self) {
            return self.indexOf(value) === index;
          });
        });

        return recordQueries;
      };

      this.updateRecordPropsIfNeeded = function () {
        var nextRecordProps = {};

        if (_this2.recordProps === null) {
          // Initial run
          nextRecordProps = _extends({}, _this2.getConvenienceProps(_this2.dataStore, _this2.sources), _this2.computeAllRecordProps(_this2.dataStore, _this2.props));
        } else if (_this2.haveOwnPropsChanged && _this2.doRecordPropsDependOnOwnProps) {
          nextRecordProps = _extends({}, _this2.recordProps, _this2.computeAllRecordProps(_this2.dataStore, _this2.props));
        } else {
          nextRecordProps = _extends({}, _this2.recordProps, _this2.computeChangedRecordProps(_this2.dataStoreChangedProps, _this2.dataStore, _this2.props));
        }

        if (_this2.recordProps && (0, _shallowEqual2.default)(nextRecordProps, _this2.recordProps)) {
          return false;
        }

        _this2.recordProps = nextRecordProps;
        return true;
      };

      this.updateMergedPropsIfNeeded = function () {
        var nextMergedProps = computeMergedProps(_this2.recordProps, _this2.props);

        if (_this2.mergedProps && (0, _shallowEqual2.default)(nextMergedProps, _this2.mergedProps)) {
          return false;
        }

        _this2.mergedProps = nextMergedProps;
        return true;
      };

      this.trySubscribe = function () {
        if (shouldSubscribe && !_this2.isListening) {
          _this2.isListening = true;
          _this2.dataStore.on("transform", _this2.handleTransform);
        }
      };

      this.tryUnsubscribe = function () {
        if (_this2.isListening) {
          _this2.isListening = null;
          _this2.dataStore.off("transform", _this2.handleTransform);
        }
      };

      this.clearCache = function () {
        _this2.convenienceProps = null;
        _this2.recordProps = null;
        _this2.mergedProps = null;
        _this2.haveOwnPropsChanged = true;
        _this2.dataStoreChangedProps = [];
        _this2.hasDataStoreChanged = true;
        _this2.renderedElement = null;
        _this2.mapRecordsIsConfigured = false;
        _this2.subscribedModels = {};
      };

      this.handleTransform = function (transform) {
        if (!_this2.isListening) {
          return;
        }

        // Iterate all transforms, to see if any of those matches a model in the list of queries
        var operationModels = [];
        transform.operations.forEach(function (operation) {
          switch (operation.op) {
            case "addRecord":
            case "replaceRecord":
              // operation.record may contains some relationships, in this case
              // its inverse relationships are modified too, we add them to operationModels.
              operationModels.push(operation.record.type);
              if (operation.record.relationships === undefined) break;
              Object.keys(operation.record.relationships).forEach(function (relationship) {
                operationModels.push(_this2.dataStore.schema.models[operation.record.type].relationships[relationship].model);
              });
              break;

            case "removeRecord":
              // If the removed record had some relationships, inverse relationships
              // are modified too. As operation.record does not contain any relationships
              // we have to assume that all its inverse relationships defined
              // in the schema could be impacted and must be added to operationModels.
              operationModels.push(operation.record.type);
              var relationships = _this2.dataStore.schema.models[operation.record.type].relationships;
              Object.keys(relationships).map(function (k) {
                return relationships[k];
              }).forEach(function (relationship) {
                operationModels.push(relationship.model);
              });
              break;

            case "replaceKey":
            case "replaceAttribute":
              operationModels.push(operation.record.type);
              break;

            case "addToRelatedRecords":
            case "removeFromRelatedRecords":
            case "replaceRelatedRecord":
              // Add both record and relatedRecord to operationModels, because
              // it can modify both its relationships and inverse relationships.
              operationModels.push(operation.record.type);
              operationModels.push(_this2.dataStore.schema.models[operation.record.type].relationships[operation.relationship].model);
              break;

            case "replaceRelatedRecords":
              operationModels.push(operation.record.type);
              operation.relatedRecords.forEach(function (relatedRecord) {
                operationModels.push(relatedRecord.type);
              });
              break;

            default:
              console.warn("This transform operation is not supported in react-orbitjs.");
          }
        });

        operationModels.forEach(function (model) {
          Object.keys(_this2.subscribedModels).forEach(function (prop) {
            if (_this2.subscribedModels[prop].includes(model)) {
              _this2.hasDataStoreChanged = true;
              _this2.dataStoreChangedProps.push(prop);
            }
          });
        });

        _this2.forceUpdate();
      };
    };

    WithData.displayName = componentDisplayName;
    WithData.WrappedComponent = WrappedComponent;
    WithData.contextTypes = {
      dataStore: _dataStoreShape2.default,
      sources: _propTypes2.default.object
    };
    WithData.propTypes = {
      dataStore: _dataStoreShape2.default,
      sources: _propTypes2.default.object
    };

    return (0, _hoistNonReactStatics2.default)(WithData, WrappedComponent);
  };
}