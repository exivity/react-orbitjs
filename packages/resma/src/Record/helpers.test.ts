import { curryFn } from './helpers'

function testCurryFn (...args: any) {
  return args
}

test('curryFn curries a function with a single argument', () => {
  const setAttribute = curryFn(testCurryFn)
  expect(setAttribute('name')('exivity')).toEqual(['name', 'exivity'])
})

test('curryFn does NOT curry when more than one argument', () => {
  const setAttribute = curryFn(testCurryFn)
  expect(setAttribute('name', 'exivity')).toEqual(['name', 'exivity'])
})