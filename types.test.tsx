import * as types from './index'
import withData from './src/components/withData'

function Test(props: { account: object, test: boolean, updateStore: Function }) {
  return <div></div>
}

const Test2 = (withData as typeof types.withData)<{ account: object }, { test: boolean }>(({ test }) => ({ account: q => q.findRecords('test') }))(Test)

const Test3 = <Test2 test />