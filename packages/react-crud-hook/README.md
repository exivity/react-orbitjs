react-crud-hook
=============

[React](https://reactjs.org/) hook for CRUD-operations and record state management.

This package attempts to make it easier to perform CRUD-operations while also providing methods to set attributes and relationships on a record. Records should conform to the JSON:API specs - https://jsonapi.org/

---

Installation
------------

_npm_

```
npm install --save react-crud-hook
```

_yarn_

```
yarn add react-crud-hook
```

API
---

### `<CrudManager/>`

```jsx
import { CrudManager } from 'react-crud-hook'

// First create a CRUD manager.
// The CRUD manager takes a single object with a promise for the createRecord, 
// updateRecord and deleteRecord attributes.
// You can use the extensions attribute to provide an object with custom extensions that
// will be returned in several callbacks later on as you perform CRUD-operations.
const manager = new CrudManager({
  createRecord: Promise<Record>,
  updateRecord: Promise<Record>,
  deleteRecord: Promise<RecordIdentifier>
  extensions: {
    dispatch: redux.dispatch,
    router: react.router,
    modal: modal
  }
})
```

### `<CrudProvider/>`

```jsx
import { CrudProvider } from 'react-crud-hook'

ReactDOM.render(
  <CrudProvider value={manager}>
    <App/>
  </CrudProvider>,
  rootElement
)
```

### `useCrud(record)`

```jsx
import useCrud from 'react-crud-hook'

const record = {
  type: 'user',
  id: '1',
  attributes: {
    name: 'Exivity'
  }
}

const ReactComponent = () => {
  const record = useCrud(record)

  // Perform mutations on mount
  useEffect(() => {
    record
      .setAttribute('name', 'Exivity rocks!')
      .setAttribute('age', 2)
      .addHasMany('employees', { type: 'employee', id: '2' })
      .addHasMany('clients', { type: 'client', id: '7' })
      .addHasOne('CEO', { type: 'CEO', id: '2' })
      .save({ 

        // Use standard callback enriched with extensions to perform side tasks
        beforeUpdate: (record, extensions) => {
          return extensions.modal('Are you sure you want to proceed with this update?')
        },
        onUpdate: (record, extensions) => {
          extensions.router.push(`/user/${user.id}`)
        }

        // You can also include custom properties that will be passed on to the CRUD // /// functions as second argument
        include: {
          .........
        }
      })
  }, [])

  // Or perform mutations on events
  return (
    <div>
      <input value={record.attributes.name}
        onChange={(e) => record.setAttribute('name', e.target.value)}/>
      <button onClick={record.save}> Click </button>
    </div>
  )
}
```

### `Methods`

| Name | Parameters | type | Description
|:---- |:---------- |:---- |:-----------
| setAttribute | ```attribute```  ```value``` | ```string```  ```any``` |Use ```setAttribute``` to update a record attribute.
| addHasMany | ```relationship: string```  ```record: RecordIdentifier``` | Use ```addHasMany``` to add a **hasMany** related record.
| addHasOne | ```relationship: string```  ```record: RecordIdentifier``` | Use ```addHasOne``` to add or replace a **hasOne** related record.
| removeRelationship | ```relationship: string```  ```relatedId: string``` | Use ```removeRelationship``` to remove a **hasOne** or **hasMany** related record.
| save | ```options?: { ...standardCallback, ...customOptions }``` | Use ```save``` to persist a record - ```save``` will determine by the presence of an **id** whether to *create* or *update*. Alongside of the standard callbacks you can provide custom options which will be passed to the provider crud-functions as second argument. 
| delete | ```options?: { ...standardCallback, ...customOptions }``` | Use ```delete``` to delete a record.

License
-------

MIT
