import { describe, it, beforeEach, afterEach } from '@bigtest/mocha';
import { visit, location } from '@bigtest/react';
import { when } from '@bigtest/convergence';
import { expect } from 'chai';
import {
  setupApplicationTest,
} from 'tests/helpers';

// usage: https://github.com/bigtestjs/react/blob/master/tests/setup-app-test.js
describe('Acceptance | Authentication', () => {
  setupApplicationTest();

  it('visits the root route', () => {

  });

  it ('shows the loader initially', () => {

  });

  describe('data is finished loading', () => {
    it('shows a list of ember versions', () => {

    });
  });
});
