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
      // this line allows `--browsers chromium` to work
      ...jestConfig.testEnvironmentOptions["jest-playwright"],
      launchOptions: {
        headless,
      },
      maxWorkers: 1,
    },
  },
};