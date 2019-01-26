import { describe, it, beforeEach, afterEach } from '@bigtest/mocha';
import { expect } from 'chai';

import { IFilter, withoutFilter } from './with-filtering';

// usage: https://github.com/bigtestjs/react/blob/master/tests/setup-app-test.js
describe('Unit | withFiltering', () => {
  describe('withoutFilter', () => {
    describe('when there are no filters', () => {
      const existing: IFilter[] = [];

      it('returns the original arrray', () => {
        const newFilter = { attribute: 'something', key: 'lt', value: 'lt:2' };
        const result = withoutFilter(existing, newFilter);

        expect(result).to.deep.equal(existing);
      });
    });

    describe('when there is one unrelated filter', () => {
      const existing: IFilter[] = [{ attribute: 'existing', value: '2' }];

      it('returns the original arrray', () => {
        const newFilter = { attribute: 'something', key: 'lt', value: 'lt:2' };
        const result = withoutFilter(existing, newFilter);

        expect(result).to.deep.equal(existing);
      });
    });

    describe('when there are matching filters', () => {
      const existing: IFilter[] = [{ attribute: 'something', key: 'lt', value: 'lt:0' }];

      it('returns an empty array', () => {
        const newFilter = { attribute: 'something', key: 'lt', value: 'lt:2' };
        const result = withoutFilter(existing, newFilter);

        expect(result).to.deep.equal([]);
      });

      it('returns the original', () => {
        const newFilter = { attribute: 'something', key: 'gt', value: 'gt:0' };
        const result = withoutFilter(existing, newFilter);

        expect(result).to.deep.equal(existing);
      });
    });

    describe('there are two matching filters', () => {
      const existing: IFilter[] = [
        { attribute: 'something', key: 'lt', value: 'lt:0' },
        { attribute: 'something', key: 'gt', value: 'gt:-1' },
      ];

      it('returns without the matching key', () => {
        const newFilter = { attribute: 'something', key: 'gt', value: 'gt:0' };
        const result = withoutFilter(existing, newFilter);
        const expected = [{ attribute: 'something', key: 'lt', value: 'lt:0' }];

        expect(result).to.deep.equal(expected);
      });
    });
  });
});
