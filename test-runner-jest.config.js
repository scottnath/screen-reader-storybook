import { chromium } from "@playwright/test";
import { getJestConfig } from "@storybook/test-runner";

/**
 * @type {import('@jest/types').Config.InitialOptions}
 */
export default {
  ...getJestConfig(),
  testTimeout: 40000, // default timeout is 15s
  testEnvironmentOptions: {
    'jest-playwright': {
      launchOptions: {
        headless: false,
      },
      maxWorkers: 1,
      // browsers: ['chromium'],
      // browsers: ['firefox'],
      browsers: ['webkit'],
      // browsers: ['firefox', 'webkit', 'chromium']
      // connectOptions: {
      //   chromium: {
      //     wsEndpoint: 'ws://127.0.0.1:3000',
      //   },
      // },
    },
  },
};