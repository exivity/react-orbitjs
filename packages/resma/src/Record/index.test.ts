import { Record } from './index'

const testRecord = {
  id: '12',
  type: 'company',
  attributes: {
    name: 'exivity'
  },
  relationships: {
    ceo: {
      data: {
        type: 'ceo',
        id: '1'
      },
    },
    employees: {
      data: [{ type: 'employee', id: '1' }]
    }
  }
}

describe('Record class', () => {
  test('record keeps reference if nothing changes', () => {
    const record = new Record(testRecord, jest.fn())
    expect(record._record).toBe(testRecord)
  })

  test('Getting record id', () => {
    const record = new Record(testRecord, jest.fn())
    expect(record.id).toBe('12')
  })

  test('Getting record type', () => {
    const record = new Record(testRecord, jest.fn())
    expect(record.type).toBe('company')
  })

  test('Getting attributes', () => {
    const record = new Record(testRecord, jest.fn())
    expect(record.attributes).toBe(record.attributes)
  })

  test('Getting relationships', () => {
    const record = new Record(testRecord, jest.fn())
    expect(record.relationships).toBe(record.relationships)
  })

  test('setAtrribute', () => {
    const mockListener = jest.fn()
    const record = new Record(testRecord, mockListener)

    record.setAttribute('name', 'cloud company')
    record.setAttribute('newAttr', 'fake value')

    expect(record.attributes.name).toBe('cloud company')
    expect(record.attributes.newAttr).toBe('fake value')
    expect(record._record).not.toBe(testRecord)
    expect(mockListener).toBeCalledWith(record._record)
  })

  test('setAtrribute curried functionality', () => {
    const mockListener = jest.fn()
    const record = new Record(testRecord, mockListener)

    record.setAttribute('name')('cloud company')
    record.setAttribute('newAttr')('fake value')

    expect(record.attributes.name).toBe('cloud company')
    expect(record.attributes.newAttr).toBe('fake value')
    expect(record._record).not.toBe(testRecord)
    expect(mockListener).toBeCalledWith(record._record)
  })

  test('addHasOne', () => {
    const mockListener = jest.fn()
    const record = new Record(testRecord, mockListener)

    const newCeo = { type: 'ceo', id: '3'}
    const newRel = { type: 'newRel', id: '1' }

    record.addHasOne('ceo', newCeo)
    record.addHasOne('newRel', newRel)

    expect(record.relationships && record.relationships.ceo.data).toBe(newCeo)
    expect(record.relationships && record.relationships.newRel.data).toBe(newRel)
    expect(record._record).not.toBe(testRecord)
    expect(mockListener).toBeCalledWith(record._record)
  })

  test('addHasOne curried functionality', () => {
    const mockListener = jest.fn()
    const record = new Record(testRecord, mockListener)

    const newCeo = { type: 'ceo', id: '3'}
    const newRel = { type: 'newRel', id: '1' }

    record.addHasOne('ceo')(newCeo)
    record.addHasOne('newRel')(newRel)

    expect(record.relationships && record.relationships.ceo.data).toBe(newCeo)
    expect(record.relationships && record.relationships.newRel.data).toBe(newRel)
    expect(record._record).not.toBe(testRecord)
    expect(mockListener).toBeCalledWith(record._record)
  })

  test('addHasMany', () => {
    const mockListener = jest.fn()
    const record = new Record(testRecord, mockListener)

    const newEmployee = { type: 'employee', id: '2'}
    const newRel = { type: 'newRel', id: '1' }

    record.addHasMany('employees', newEmployee)
    record.addHasMany('newRel', newRel)

    expect(record.relationships && record.relationships.employees.data)
       .toEqual([{ type: 'employee', id: '1' }, newEmployee])
    expect(record.relationships && record.relationships.newRel.data).toEqual([newRel])
    expect(record._record).not.toBe(testRecord)
    expect(mockListener).toBeCalledWith(record._record)
  })

  test('addHasMany curried functionality', () => {
    const mockListener = jest.fn()
    const record = new Record(testRecord, mockListener)

    const newEmployee = { type: 'employee', id: '2'}
    const newRel = { type: 'newRel', id: '1' }

    record.addHasMany('employees')(newEmployee)
    record.addHasMany('newRel')(newRel)

    expect(record.relationships && record.relationships.employees.data)
       .toEqual([{ type: 'employee', id: '1' }, newEmployee])
    expect(record.relationships && record.relationships.newRel.data).toEqual([newRel])
    expect(record._record).not.toBe(testRecord)
    expect(mockListener).toBeCalledWith(record._record)
  })

  test('removeRelationship', () => {
    const mockListener = jest.fn()
    const record = new Record(testRecord, mockListener)

    record.removeRelationship('employees', '1')
    record.removeRelationship('ceo', '1')

    expect(record.relationships && record.relationships.employees.data).toEqual([])
    expect(record.relationships && record.relationships.ceo.data).toEqual({})
    expect(record._record).not.toBe(testRecord)
    expect(mockListener).toBeCalledWith(record._record)
  })

  test('removeRelationship curried functionality', () => {
    const mockListener = jest.fn()
    const record = new Record(testRecord, mockListener)

    record.removeRelationship('employees')('1')
    record.removeRelationship('ceo')('1')

    expect(record.relationships && record.relationships.employees.data).toEqual([])
    expect(record.relationships && record.relationships.ceo.data).toEqual({})
    expect(record._record).not.toBe(testRecord)
    expect(mockListener).toBeCalledWith(record._record)
  })

  test('chaining methods', () => {
    const mockListener = jest.fn()
    const record = new Record(testRecord, mockListener)

    const newCeo = { type: 'ceo', id: '3'}
    const newPhoto = { type: 'photo', id: '1'}

    record
       .setAttribute('name', 'Michiel de Vos')
       .addHasOne('ceo', newCeo)
       .addHasMany('photos', newPhoto)
       .removeRelationship('employees', '1')

    expect(record.attributes.name).toBe('Michiel de Vos')
    expect(record.relationships && record.relationships.ceo.data).toBe(newCeo)
    expect(record.relationships && record.relationships.photos.data).toEqual([newPhoto])
    expect(record.relationships && record.relationships.employees.data).toEqual([])
  })
})

