import {Component, createElement} from "react"
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

export default function withData(mapRecordsToProps, mergeProps) {
  const shouldSubscribe = Boolean(mapRecordsToProps)

  const mapRecords = mapRecordsToProps || defaultMapRecordsToProps
  const finalMergeProps = mergeProps || defaultMergeProps

  return function wrapWithConnect(WrappedComponent) {
    const componentDisplayName = `WithData(${getDisplayName(WrappedComponent)})`

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
          queryStore: (...args) => dataStore.query(...args),
          updateStore: (...args) => dataStore.update(...args),
        }

        Object.keys(recordQueries).forEach(prop => {
          try {
            recordProps[prop] = dataStore.cache.query(recordQueries[prop])
          } catch (error) {
            console.warn(error.message)
            recordProps[prop] = undefined
          }
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
              this.subscribedModels.push(expression.record.type)
              break

            case "findRecords":
              this.subscribedModels.push(expression.type)
              break

            case "findRelatedRecord":
            case "findRelatedRecords":
              this.subscribedModels.push(expression.record.type)
              this.subscribedModels.push(this.dataStore.schema.models[expression.record.type].relationships[expression.relationship].model)
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

            case "addToRelatedRecords":
            case "removeFromRelatedRecords":
            case "replaceRelatedRecord":
              // Add both record and relatedRecord to operationModels, because
              // it can modify both its relationships and inverse relationships.
              operationModels.push(operation.record.type)
              operationModels.push(operation.relatedRecord.type)
              break

            case "replaceRelatedRecords":
              operationModels.push(operation.record.type)
              operation.relatedRecords.forEach((relatedRecord) => {
                operationModels.push(relatedRecord.type)
              })
              break

            default:
              console.warn("This transform operation is not supported in react-orbitjs.")
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
          renderedElement,
        } = this

        this.haveOwnPropsChanged = false
        this.hasDataStoreChanged = false

        let shouldUpdateRecordProps = true
        if (renderedElement) {
          shouldUpdateRecordProps = hasDataStoreChanged || (
            haveOwnPropsChanged && this.doRecordPropsDependOnOwnProps
          )
        }

        let haveRecordPropsChanged = false
        if (shouldUpdateRecordProps) {
          haveRecordPropsChanged = this.updateRecordPropsIfNeeded()
        }

        let haveMergedPropsChanged = true
        if (
          haveRecordPropsChanged ||
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
