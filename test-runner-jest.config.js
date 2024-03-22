import { getJestConfig } from "@storybook/test-runner";

const testRunnerConfig = getJestConfig();
const headless = process.env.HEADLESS || false;
console.log('HEADLESS', headless);

/**
 * @type {import('@jest/types').Config.InitialOptions}
 */
export default {
  ...testRunnerConfig,
  testTimeout: 40000, // default timeout is 15s
  testEnvironmentOptions: {
    'jest-playwright': {
      // this line allows `--browsers chromium` to work
      ...testRunnerConfig.testEnvironmentOptions["jest-playwright"],
      launchOptions: {
        headless,
      },
      maxWorkers: 1,
    },
  },
};