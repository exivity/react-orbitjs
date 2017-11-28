import { Component, createElement } from "react"
import dataStoreShape from "../utils/dataStoreShape"
import shallowEqual from "../utils/shallowEqual"
import hoistStatics from "hoist-non-react-statics"

const defaultMapRecordsToProps = {}
const defaultMergeProps = (recordProps, parentProps) => ({
  ...parentProps,
  ...recordProps,
})

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || "Component"
}

let errorObject = {value: null}

function tryCatch(fn, ctx) {
  try {
    return fn.apply(ctx)
  } catch (e) {
    errorObject.value = e
    return errorObject
  }
}

export default function withData(mapRecordsToProps, mergeProps) {
  const shouldSubscribe = Boolean(mapRecordsToProps)

  const mapRecords = mapRecordsToProps || defaultMapRecordsToProps
  const finalMergeProps = mergeProps || defaultMergeProps

  return function wrapWithConnect(WrappedComponent) {
    const componentDisplayName = `withData(${getDisplayName(WrappedComponent)})`

    function computeMergedProps(stateProps, parentProps) {
      return finalMergeProps(stateProps, parentProps)
    }

    class WithData extends Component {
      shouldComponentUpdate() {
        return this.haveOwnPropsChanged || this.hasDataStoreChanged
      }

      constructor(props, context) {
        super(props, context)
        this.dataStore = props.dataStore || context.dataStore

        if (!this.dataStore) {
          throw new Error(
            `Could not find "dataStore" in either the context or ` +
            `props of "${componentDisplayName}". ` +
            `Either wrap the root component in a <DataProvider>, ` +
            `or explicitly pass "dataStore" as a prop to "${componentDisplayName}".`,
          )
        }

        // const storeState = this.dataStore.getState()
        // this.state = {storeState}
        this.clearCache()
      }

      computeRecordProps = (dataStore, props) => {
        const recordQueries = this.getRecordQueries(dataStore, props)

        const recordProps = {
          updateStore: (...args) => dataStore.update(...args),
        }

        Object.keys(recordQueries).forEach(prop => {
          recordProps[prop] = dataStore.cache.query(recordQueries[prop])
        })

        return recordProps
      }

      getRecordQueries = (dataStore, props) => {
        if (!this.mapRecordsIsConfigured
          || (this.doRecordPropsDependOnOwnProps && this.haveOwnPropsChanged)) {
          return this.configureMapRecords(dataStore, props)
        }

        return this.mapRecordsGivenOwnProps(props)
      }

      mapRecordsGivenOwnProps = (props) => {
        return this.doRecordPropsDependOnOwnProps ?
          mapRecords(props) :
          mapRecords
      }

      configureMapRecords = (dataStore, props) => {
        this.doRecordPropsDependOnOwnProps = (typeof mapRecords === "function") && mapRecords.length > 0
        this.mapRecordsIsConfigured = true

        const recordQueries = this.mapRecordsGivenOwnProps(props)

        // Iterate all queries, to make a list of models to listen for
        Object.keys(recordQueries).forEach(prop => {
          const expression = recordQueries[prop](dataStore.queryBuilder).expression

          switch (expression.op) {
            case "findRecord":
            case "findRecords":
              this.subscribedModels.push(expression.type)
              break

            case "findRelatedRecord":
            case "findRelatedRecords":
              this.subscribedModels.push(expression.record.type)
              // @todo map expression.record.relationship to type (from store schema)
              // this.subscribedModels.push(...)
              console.warn("The queries findRelatedRecord and findRelatedRecords are not fully supported yet in" +
                " react-orbitjs.")
          }
        })

        this.subscribedModels = this.subscribedModels.filter((value, index, self) => self.indexOf(value) === index)

        return recordQueries
      }

      updateRecordPropsIfNeeded = () => {
        const nextRecordProps = this.computeRecordProps(this.dataStore, this.props)

        if (this.recordProps && shallowEqual(nextRecordProps, this.recordProps)) {
          return false
        }

        this.recordProps = nextRecordProps
        return true
      }

      updateMergedPropsIfNeeded = () => {
        const nextMergedProps = computeMergedProps(this.recordProps, this.props)
        if (this.mergedProps && shallowEqual(nextMergedProps, this.mergedProps)) {
          return false
        }

        this.mergedProps = nextMergedProps
        return true
      }

      trySubscribe = () => {
        if (shouldSubscribe && !this.isListening) {
          this.isListening = true
          this.dataStore.on("transform", this.handleTransform)
        }
      }

      tryUnsubscribe = () => {
        if (this.isListening) {
          this.isListening = null
          this.dataStore.off("transform", this.handleTransform)
        }
      }

      componentDidMount() {
        this.trySubscribe()
      }

      componentWillReceiveProps(nextProps) {
        if (!shallowEqual(nextProps, this.props)) {
          this.haveOwnPropsChanged = true
        }
      }

      componentWillUnmount() {
        this.tryUnsubscribe()
        this.clearCache()
      }

      clearCache = () => {
        this.recordProps = null
        this.mergedProps = null
        this.haveOwnPropsChanged = true
        this.hasDataStoreChanged = true
        this.haveRecordPropsBeenPrecalculated = false
        this.recordPropsPrecalculationError = null
        this.renderedElement = null
        this.mapRecordsIsConfigured = false
        this.subscribedModels = []
      }

      handleTransform = (transform) => {
        if (!this.isListening) {
          return
        }

        // Iterate all transforms, to see if any of those matches a model in the list of queries
        const operationModels = []
        transform.operations.forEach(operation => {
          switch (operation.op) {
            case "addRecord":
            case "removeRecord":
            case "replaceRecord":
            case "replaceKey":
            case "replaceAttribute":
              operationModels.push(operation.record.type)
              break

            default:
              // @todo handle other operations
              console.warn("This transform operation is not yet supported in react-orbitjs.")
          }
        })

        operationModels.some(model => {
          if (this.subscribedModels.indexOf(model) !== -1) {
            this.hasDataStoreChanged = true
            return true
          }
        })

        this.forceUpdate()
      }

      render() {
        const {
          haveOwnPropsChanged,
          hasDataStoreChanged,
          haveRecordPropsBeenPrecalculated,
          recordPropsPrecalculationError,
          renderedElement,
        } = this

        this.haveOwnPropsChanged = false
        this.hasDataStoreChanged = false
        this.haveRecordPropsBeenPrecalculated = false
        this.recordPropsPrecalculationError = null

        if (recordPropsPrecalculationError) {
          throw recordPropsPrecalculationError
        }

        let shouldUpdateStateProps = true
        if (renderedElement) {
          shouldUpdateStateProps = hasDataStoreChanged || (
            haveOwnPropsChanged && this.doRecordPropsDependOnOwnProps
          )
        }

        let haveStatePropsChanged = false
        if (haveRecordPropsBeenPrecalculated) {
          haveStatePropsChanged = true
        } else if (shouldUpdateStateProps) {
          haveStatePropsChanged = this.updateRecordPropsIfNeeded()
        }

        let haveMergedPropsChanged = true
        if (
          haveStatePropsChanged ||
          haveOwnPropsChanged
        ) {
          haveMergedPropsChanged = this.updateMergedPropsIfNeeded()
        } else {
          haveMergedPropsChanged = false
        }

        if (!haveMergedPropsChanged && renderedElement) {
          return renderedElement
        }

        this.renderedElement = createElement(WrappedComponent,
          this.mergedProps,
        )

        return this.renderedElement
      }
    }

    WithData.displayName = componentDisplayName
    WithData.WrappedComponent = WrappedComponent
    WithData.contextTypes = {
      dataStore: dataStoreShape,
    }
    WithData.propTypes = {
      dataStore: dataStoreShape,
    }

    return hoistStatics(WithData, WrappedComponent)
  }
}
