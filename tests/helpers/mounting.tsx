import { beforeEach, afterEach } from '@bigtest/mocha';
import { setupAppForTesting } from '@bigtest/react';
import createHistory from 'history/createMemoryHistory';

import Application from 'dummy-app/ui/application';

import 'dummy-app/ui/styles/app.scss';

function resetBrowser() {
  localStorage.clear();
}

export function setupApplicationTest(initialState = {}, history?: History) {
  beforeEach(async function() {
    resetBrowser();

    const historyForTesting = history || createHistory();

    this.app = await setupAppForTesting(Application, {
      props: {
        initialState,
        history: historyForTesting,
      },
    });
  });

  afterEach(() => {
    resetBrowser();
  });
}
