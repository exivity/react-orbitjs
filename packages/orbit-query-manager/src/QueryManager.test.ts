import { TransformBuilder, QueryBuilder, Schema } from "@orbit/data";
import { QueryManager } from "./QueryManager";
import Store from "@orbit/store";

const store = new Store({
  schema: new Schema({
    models: {
      account: {
        attributes: {}
      }
    }
  })
})

store.update((t: TransformBuilder) => [
  t.addRecord({ type: 'account', id: '1' }),
  t.addRecord({ type: 'account', id: '2' }),
  t.addRecord({ type: 'account', id: '3' }),
  t.addRecord({ type: 'account', id: '4' })
])

const manager = new QueryManager(store, { hello: 'hi' })

const listener = () => { }

// manager.query({
//   Account: (q: QueryBuilder) => q.findRecord({ type: 'account', id: '1' }),
//   Account2: (q: QueryBuilder) => q.findRecord({ type: 'account', id: '2' }),
//   Account3: (q: QueryBuilder) => q.findRecord({ type: 'account', id: '3' }),
//   Account4: (q: QueryBuilder) => q.findRecord({ type: 'account', id: '4' }),
// }, listener, {
//     beforeQuery: (expression, extensions) => {
//       console.log('before', expression, extensions)
//     },
//     onQuery: (records, extensions) => {
//       console.log('on', records, extensions)
//     },
//     onError: (error, terms, extensions) => {
//       console.log('error', error, terms, extensions)
//     }
//   }
// )

// manager.query({
//   Account: (q: QueryBuilder) => q.findRecord({ type: 'account', id: '1' }),
//   Account2: (q: QueryBuilder) => q.findRecord({ type: 'account', id: '2' }),
//   Account3: (q: QueryBuilder) => q.findRecord({ type: 'account', id: '3' }),
//   Account4: (q: QueryBuilder) => q.findRecord({ type: 'account', id: '4' }),
// }, listener)