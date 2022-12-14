/* eslint-disable @typescript-eslint/no-unused-vars */
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    video: false,
    baseUrl: 'http://localhost:8080',
    screenshotOnRunFailure: false,
    defaultCommandTimeout: 7000,
    retries: {
      openMode: 0,
      runMode: 1,
    },
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
