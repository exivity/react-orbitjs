import { curryFn, hasRelationship, getRelationship, removeHasMany } from './helpers'

function testCurryFn (...args: any) {
  return args
}

test('removeHasMany should remove a hasMany relation from a record', () => {
  const record = {
    type: 'record',
    attributes: {},
    relationships: {
      photos: {
        data: [ { type: 'photo', id: '1' }, { type: 'photo', id: '2' }]
      }
    }
  }

  const newRelationships = removeHasMany.call(record, 'photos', '2')

  expect(newRelationships).toEqual([{ type: 'photo', id: '1' }])
  expect(newRelationships).not.toBe(record.relationships.photos.data)
})

test('hasRelationship checks if a relationship exists', () => {
  const record = {
    type: 'record',
    attributes: {},
    relationships: {
      photos: {
        data: [ { type: 'photo', id: '1' }, { type: 'photo', id: '2' }]
      }
    }
  }

  const relationshipPresent = hasRelationship.call(record, 'photos')
  const relationshipNotPresent = hasRelationship.call(record, 'horses')

  expect(relationshipPresent).toBe(true)
  expect(relationshipNotPresent).toBe(false)
})

test('getRelationship returns specified relation', () => {
  const record = {
    type: 'record',
    attributes: {},
    relationships: {
      photos: {
        data: [ { type: 'photo', id: '1' }, { type: 'photo', id: '2' }]
      }
    }
  }

  const photos = getRelationship.call(record, 'photos')
  expect(photos).toBe(record.relationships.photos.data)
})

test('curryFn curries a function with a single argument', () => {
  const setAttribute = curryFn(testCurryFn)
  expect(setAttribute('name')('exivity')).toEqual(['name', 'exivity'])
})

test('curryFn does NOT curry when more than one argument', () => {
  const setAttribute = curryFn(testCurryFn)
  expect(setAttribute('name', 'exivity')).toEqual(['name', 'exivity'])
})