import { Component, createElement } from "react"
import dataStoreShape from "../utils/dataStoreShape"
import shallowEqual from "../utils/shallowEqual"
import hoistStatics from "hoist-non-react-statics"

const defaultMapRecordsToProps = state => ({})
const defaultMergeProps = (recordProps, parentProps) => ({
  ...parentProps,
  ...recordProps,
})

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || "Component"
}

let errorObject = { value: null }
function tryCatch(fn, ctx) {
  try {
    return fn.apply(ctx)
  } catch (e) {
    errorObject.value = e
    return errorObject
  }
}

export default function withData(mapRecordsToProps, mergeProps, options = {}) {
  const shouldSubscribe = Boolean(mapRecordsToProps)

  const mapRecords = mapRecordsToProps || defaultMapRecordsToProps
  const finalMergeProps = mergeProps || defaultMergeProps

  const {pure = true} = options
  const checkMergedEquals = pure && finalMergeProps !== defaultMergeProps

  return function wrapWithConnect(WrappedComponent) {
    const componentDisplayName = `withData(${getDisplayName(WrappedComponent)})`

    function computeMergedProps(stateProps, parentProps) {
      return finalMergeProps(stateProps, parentProps)
    }

    class WithData extends Component {
      shouldComponentUpdate() {
        return !pure || this.haveOwnPropsChanged || this.hasStoreStateChanged
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

        const storeState = this.dataStore.getState()
        this.state = {storeState}
        this.clearCache()
      }

      computeRecordProps(store, props) {
        if (!this.finalMapStateToProps) {
          return this.configureFinalMapState(store, props)
        }

        const state = store.getState()
        const stateProps = this.doStatePropsDependOnOwnProps ?
          this.finalMapStateToProps(state, props) :
          this.finalMapStateToProps(state)


        return stateProps
      }

      configureFinalMapState(store, props) {
        const mappedState = mapRecords(store.getState(), props)
        const isFactory = typeof mappedState === "function"

        this.finalMapStateToProps = isFactory ? mappedState : mapRecords
        this.doStatePropsDependOnOwnProps = this.finalMapStateToProps.length !== 1

        if (isFactory) {
          return this.computeRecordProps(store, props)
        }

        return mappedState
      }

      computeDispatchProps(store, props) {
        if (!this.finalMapDispatchToProps) {
          return this.configureFinalMapDispatch(store, props)
        }

        const {dispatch} = store
        const dispatchProps = this.doDispatchPropsDependOnOwnProps ?
          this.finalMapDispatchToProps(dispatch, props) :
          this.finalMapDispatchToProps(dispatch)

        return dispatchProps
      }

      configureFinalMapDispatch(store, props) {
        const mappedDispatch = mapDispatch(store.dispatch, props)
        const isFactory = typeof mappedDispatch === "function"

        this.finalMapDispatchToProps = isFactory ? mappedDispatch : mapDispatch
        this.doDispatchPropsDependOnOwnProps = this.finalMapDispatchToProps.length !== 1

        if (isFactory) {
          return this.computeDispatchProps(store, props)
        }

        return mappedDispatch
      }

      updateStatePropsIfNeeded() {
        const nextStateProps = this.computeRecordProps(this.dataStore, this.props)
        if (this.stateProps && shallowEqual(nextStateProps, this.stateProps)) {
          return false
        }

        this.stateProps = nextStateProps
        return true
      }

      updateDispatchPropsIfNeeded() {
        const nextDispatchProps = this.computeDispatchProps(this.dataStore, this.props)
        if (this.dispatchProps && shallowEqual(nextDispatchProps, this.dispatchProps)) {
          return false
        }

        this.dispatchProps = nextDispatchProps
        return true
      }

      updateMergedPropsIfNeeded() {
        const nextMergedProps = computeMergedProps(this.stateProps, this.dispatchProps, this.props)
        if (this.mergedProps && checkMergedEquals && shallowEqual(nextMergedProps, this.mergedProps)) {
          return false
        }

        this.mergedProps = nextMergedProps
        return true
      }

      isSubscribed() {
        return typeof this.unsubscribe === "function"
      }

      trySubscribe() {
        if (shouldSubscribe && !this.unsubscribe) {
          this.unsubscribe = this.dataStore.subscribe(this.handleChange.bind(this))
          this.handleChange()
        }
      }

      tryUnsubscribe() {
        if (this.unsubscribe) {
          this.unsubscribe()
          this.unsubscribe = null
        }
      }

      componentDidMount() {
        this.trySubscribe()
      }

      componentWillReceiveProps(nextProps) {
        if (!pure || !shallowEqual(nextProps, this.props)) {
          this.haveOwnPropsChanged = true
        }
      }

      componentWillUnmount() {
        this.tryUnsubscribe()
        this.clearCache()
      }

      clearCache() {
        this.dispatchProps = null
        this.stateProps = null
        this.mergedProps = null
        this.haveOwnPropsChanged = true
        this.hasStoreStateChanged = true
        this.haveStatePropsBeenPrecalculated = false
        this.statePropsPrecalculationError = null
        this.renderedElement = null
        this.finalMapDispatchToProps = null
        this.finalMapStateToProps = null
      }

      handleChange() {
        if (!this.unsubscribe) {
          return
        }

        const storeState = this.dataStore.getState()
        const prevStoreState = this.state.storeState
        if (pure && prevStoreState === storeState) {
          return
        }

        if (pure && !this.doStatePropsDependOnOwnProps) {
          const haveStatePropsChanged = tryCatch(this.updateStatePropsIfNeeded, this)
          if (!haveStatePropsChanged) {
            return
          }
          if (haveStatePropsChanged === errorObject) {
            this.statePropsPrecalculationError = errorObject.value
          }
          this.haveStatePropsBeenPrecalculated = true
        }

        this.hasStoreStateChanged = true
        this.setState({storeState})
      }

      render() {
        const {
          haveOwnPropsChanged,
          hasStoreStateChanged,
          haveStatePropsBeenPrecalculated,
          statePropsPrecalculationError,
          renderedElement,
        } = this

        this.haveOwnPropsChanged = false
        this.hasStoreStateChanged = false
        this.haveStatePropsBeenPrecalculated = false
        this.statePropsPrecalculationError = null

        if (statePropsPrecalculationError) {
          throw statePropsPrecalculationError
        }

        let shouldUpdateStateProps = true
        let shouldUpdateDispatchProps = true
        if (pure && renderedElement) {
          shouldUpdateStateProps = hasStoreStateChanged || (
            haveOwnPropsChanged && this.doStatePropsDependOnOwnProps
          )
          shouldUpdateDispatchProps =
            haveOwnPropsChanged && this.doDispatchPropsDependOnOwnProps
        }

        let haveStatePropsChanged = false
        let haveDispatchPropsChanged = false
        if (haveStatePropsBeenPrecalculated) {
          haveStatePropsChanged = true
        } else if (shouldUpdateStateProps) {
          haveStatePropsChanged = this.updateStatePropsIfNeeded()
        }
        if (shouldUpdateDispatchProps) {
          haveDispatchPropsChanged = this.updateDispatchPropsIfNeeded()
        }

        let haveMergedPropsChanged = true
        if (
          haveStatePropsChanged ||
          haveDispatchPropsChanged ||
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
