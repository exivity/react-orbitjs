import { describe, it, beforeEach } from '@bigtest/mocha';
import { visit, location } from '@bigtest/react';
import { when } from '@bigtest/convergence';
import { expect } from 'chai';
import {
  setupApplicationTest,
} from 'tests/helpers';

import app from 'tests/helpers/pages/app';

describe('Acceptance | Authentication', () => {
  setupApplicationTest();

  beforeEach(async function() {
    await visit('/');
  });

  it('visits the root route', () => {
    expect(location().pathname).to.equal('/');
  });

  it ('shows the loader initially', () => {
    expect(app.pageText).to.not.include('Projects JSON');
    expect(app.pageText).to.include('Loading');
  });

  describe('data is finished loading', () => {
    it('shows a list of ember versions', () => {
      expect(app.pageText).to.include('Projects JSON');
    });
  });
});
