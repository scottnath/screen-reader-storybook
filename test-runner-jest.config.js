import { chromium } from "@playwright/test";
import { getJestConfig } from "@storybook/test-runner";

const jestConfig = getJestConfig();
const headless = process.env.HEADLESS || false;

/**
 * @type {import('@jest/types').Config.InitialOptions}
 */
export default {
  ...jestConfig,
  testTimeout: 40000, // default timeout is 15s
  testEnvironmentOptions: {
    'jest-playwright': {
      ...jestConfig.testEnvironmentOptions["jest-playwright"],
      launchOptions: {
        headless,
      },
      maxWorkers: 1,
      // browsers: ['chromium'],
      // browsers: ['firefox'],
      // browsers: ['webkit'],
      // browsers: ['firefox', 'webkit', 'chromium']
      // connectOptions: {
      //   chromium: {
      //     wsEndpoint: 'ws://127.0.0.1:3000',
      //   },
      // },
    },
  },
};