import { Component, createElement } from 'react'
import dataStoreShape from '../utils/dataStoreShape'
import shallowEqual from '../utils/shallowEqual'
import hoistStatics from 'hoist-non-react-statics'

const defaultMapRecordsToProps = {}
const defaultMergeProps = (recordProps, parentProps) => ({
  ...parentProps,
  ...recordProps
})

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component'
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
              `or explicitly pass "dataStore" as a prop to "${componentDisplayName}".`
          )
        }

        // const storeState = this.dataStore.getState()
        // this.state = {storeState}
        this.clearCache()
      }

      computeChangedRecordProps = (selectedRecordProps, dataStore, props) => {
        return this.selectivelyComputeRecordProps(
          selectedRecordProps,
          dataStore,
          props
        )
      }

      computeAllRecordProps = (dataStore, props) => {
        return this.selectivelyComputeRecordProps(true, dataStore, props)
      }

      selectivelyComputeRecordProps = (
        selectedRecordPropsOrAll,
        dataStore,
        props
      ) => {
        let recordQueries

        if (
          selectedRecordPropsOrAll === true ||
          selectedRecordPropsOrAll.length
        ) {
          recordQueries = this.getRecordQueries(dataStore, props)
        }

        if (selectedRecordPropsOrAll === true) {
          selectedRecordPropsOrAll = Object.keys(recordQueries)
        }

        const recordProps = {}

        selectedRecordPropsOrAll.forEach(prop => {
          try {
            recordProps[prop] = dataStore.cache.query(recordQueries[prop])
          } catch (error) {
            console.warn(error.message)
            recordProps[prop] = undefined
          }
        })

        return recordProps
      }

      getConvenienceProps = dataStore => {
        if (!this.convenienceProps) {
          this.convenienceProps = {
            queryStore: (...args) => dataStore.query(...args),
            updateStore: (...args) => dataStore.update(...args)
          }
        }

        return this.convenienceProps
      }

      getRecordQueries = (dataStore, props) => {
        if (
          !this.mapRecordsIsConfigured ||
          (this.doRecordPropsDependOnOwnProps && this.haveOwnPropsChanged)
        ) {
          return this.configureMapRecords(dataStore, props)
        }

        return this.mapRecordsGivenOwnProps(props)
      }

      mapRecordsGivenOwnProps = props => {
        return this.recordPropsIsFunction ? mapRecords(props) : mapRecords
      }

      configureMapRecords = (dataStore, props) => {
        this.recordPropsIsFunction = typeof mapRecords === 'function'
        this.doRecordPropsDependOnOwnProps =
          this.recordPropsIsFunction && mapRecords.length > 0
        this.mapRecordsIsConfigured = true

        const recordQueries = this.mapRecordsGivenOwnProps(props)
        const recordQueryKeys = Object.keys(recordQueries)

        // Reset subscribedModels so mapRecordsToProps can return different keys with each update
        // and we don't listen for stale record props.
        this.subscribedModels = {}

        recordQueryKeys.forEach(prop => (this.subscribedModels[prop] = []))

        // Iterate all queries, to make a list of models to listen for
        recordQueryKeys.forEach(prop => {
          const expression = recordQueries[prop](dataStore.queryBuilder)
            .expression

          // console.log({ expression })

          switch (expression.op) {
            case 'findRecord':
              this.subscribedModels[prop].push(expression.record.type)
              break

            case 'findRecords':
              this.subscribedModels[prop].push(expression.type)
              break

            case 'findRelatedRecord':
            case 'findRelatedRecords':
              this.subscribedModels[prop].push(expression.record.type)
              this.subscribedModels[prop].push(
                this.dataStore.schema.models[expression.record.type]
                  .relationships[expression.relationship].model
              )
          }
        })

        recordQueryKeys.forEach(prop => {
          this.subscribedModels[prop] = this.subscribedModels[prop].filter(
            (value, index, self) => self.indexOf(value) === index
          )
        })

        return recordQueries
      }

      updateRecordPropsIfNeeded = () => {
        let nextRecordProps = {}

        if (this.recordProps === null) {
          nextRecordProps = {
            ...this.getConvenienceProps(this.dataStore),
            ...this.computeAllRecordProps(this.dataStore, this.props)
          }
        } else if (
          this.haveOwnPropsChanged &&
          this.doRecordPropsDependOnOwnProps
        ) {
          nextRecordProps = {
            ...this.recordProps,
            ...this.computeAllRecordProps(this.dataStore, this.props)
          }

          // Remove all props no longer returned from mapRecordsToProps
          const recordQueryKeys = Object.keys(this.subscribedModels)
          Object.keys(this.recordProps)
            .filter(key => !recordQueryKeys.includes(key))
            .forEach(key => delete nextRecordProps[key])
        } else {
          nextRecordProps = {
            ...this.recordProps,
            ...this.computeChangedRecordProps(
              this.dataStoreChangedProps,
              this.dataStore,
              this.props
            )
          }
        }

        if (
          this.recordProps &&
          shallowEqual(nextRecordProps, this.recordProps)
        ) {
          return false
        }

        this.recordProps = nextRecordProps
        return true
      }

      updateMergedPropsIfNeeded = () => {
        const nextMergedProps = computeMergedProps(this.recordProps, this.props)

        if (
          this.mergedProps &&
          shallowEqual(nextMergedProps, this.mergedProps)
        ) {
          return false
        }

        this.mergedProps = nextMergedProps
        return true
      }

      trySubscribe = () => {
        if (shouldSubscribe && !this.isListening) {
          this.isListening = true
          this.dataStore.on('transform', this.handleTransform)
        }
      }

      tryUnsubscribe = () => {
        if (this.isListening) {
          this.isListening = null
          this.dataStore.off('transform', this.handleTransform)
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
        this.convenienceProps = null
        this.recordProps = null
        this.mergedProps = null
        this.haveOwnPropsChanged = true
        this.dataStoreChangedProps = []
        this.hasDataStoreChanged = true
        this.renderedElement = null
        this.mapRecordsIsConfigured = false
        this.subscribedModels = {}
      }

      handleTransform = transform => {
        if (!this.isListening) {
          return
        }

        // Iterate all transforms, to see if any of those matches a model in the list of queries
        const operationModels = []
        transform.operations.forEach(operation => {
          switch (operation.op) {
            case 'addRecord':
            case 'replaceRecord':
              // operation.record may contains some relationships, in this case
              // its inverse relationships are modified too, we add them to operationModels.
              operationModels.push(operation.record.type)
              if (operation.record.relationships === undefined) break
              Object.keys(operation.record.relationships).forEach(
                relationship => {
                  operationModels.push(
                    this.dataStore.schema.models[operation.record.type]
                      .relationships[relationship].model
                  )
                }
              )
              break

            case 'removeRecord':
              // If the removed record had some relationships, inverse relationships
              // are modified too. As operation.record does not contain any relationships
              // we have to assume that all its inverse relationships defined
              // in the schema could be impacted and must be added to operationModels.
              operationModels.push(operation.record.type)
              const relationships = this.dataStore.schema.models[
                operation.record.type
              ].relationships
              Object.keys(relationships)
                .map(k => relationships[k])
                .forEach(relationship => {
                  operationModels.push(relationship.model)
                })
              break

            case 'replaceKey':
            case 'replaceAttribute':
              operationModels.push(operation.record.type)
              break

            case 'addToRelatedRecords':
            case 'removeFromRelatedRecords':
            case 'replaceRelatedRecord':
              // Add both record and relatedRecord to operationModels, because
              // it can modify both its relationships and inverse relationships.
              operationModels.push(operation.record.type)
              operationModels.push(
                this.dataStore.schema.models[operation.record.type]
                  .relationships[operation.relationship].model
              )
              break

            case 'replaceRelatedRecords':
              operationModels.push(operation.record.type)
              operation.relatedRecords.forEach(relatedRecord => {
                operationModels.push(relatedRecord.type)
              })
              break

            default:
              console.warn(
                'This transform operation is not supported in react-orbitjs.'
              )
          }
        })

        const uniqueOperationModels = new Set(operationModels)

        uniqueOperationModels.forEach(model => {
          Object.keys(this.subscribedModels).forEach(prop => {
            if (this.subscribedModels[prop].includes(model)) {
              this.hasDataStoreChanged = true
              this.dataStoreChangedProps.push(prop)
            }
          })
        })

        this.forceUpdate()
      }

      render() {
        const {
          haveOwnPropsChanged,
          hasDataStoreChanged,
          renderedElement
        } = this

        let shouldUpdateRecordProps = true
        if (renderedElement) {
          shouldUpdateRecordProps =
            hasDataStoreChanged ||
            (haveOwnPropsChanged && this.doRecordPropsDependOnOwnProps)
        }

        let haveRecordPropsChanged = false
        if (shouldUpdateRecordProps) {
          haveRecordPropsChanged = this.updateRecordPropsIfNeeded()
        }

        this.haveOwnPropsChanged = false
        this.hasDataStoreChanged = false
        this.dataStoreChangedProps = []

        let haveMergedPropsChanged = true
        if (haveRecordPropsChanged || haveOwnPropsChanged) {
          haveMergedPropsChanged = this.updateMergedPropsIfNeeded()
        } else {
          haveMergedPropsChanged = false
        }

        if (!haveMergedPropsChanged && renderedElement) {
          return renderedElement
        }

        this.renderedElement = createElement(WrappedComponent, this.mergedProps)

        return this.renderedElement
      }
    }

    WithData.displayName = componentDisplayName
    WithData.WrappedComponent = WrappedComponent
    WithData.contextTypes = {
      dataStore: dataStoreShape
    }
    WithData.propTypes = {
      dataStore: dataStoreShape
    }

    return hoistStatics(WithData, WrappedComponent)
  }
}
