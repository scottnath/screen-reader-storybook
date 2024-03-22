# screen-reader-storybook

Testing combining windows/mac screen readers with a Storybook environment

## Original source code from Storybook sandbox

The original code for this was copied from a default Storybook sandbox for a vanilla javascript, `html-vite` setup.

https://github.com/storybookjs/sandboxes/tree/next/html-vite/default-js/after-storybook

## Steps followed to prepare this repo for screen reader testing

### Step 1: Get `@storybook/test-runner` working

This step's instructions are not unique to setting up screen reader testing with Storybook, but they are required to use Guidepup and read your components with a screen reader.

This repository has [a v0.0.1 tagged release which has `@storybook/test-runner` set up following this step][repo-initial-setup]. If you'd like to skip this step and copy-pasta instead, the v0.0.1 tagged release has a basic vite-HTML Storybook with `@storybook/test-runner` already working. Otherwise, follow these steps to add `@storybook/test-runner` to your environment.


1. Follow the [Getting Started instructions for @storybook/test-runner][sb-test-runner-get-started] to set up test-runner in your environment. This is just the basic initial setup to use `test-storybook`, but it's best to get the basics working before continuing.
1. Create a test-runner.js file at `.storybook/test-runner.js`. This sets up your Storybook to use the runner's `Test hooks API`. See the [details about the test-runner Test hooks API][sb-test-runner-hooks-api]. For now, you may keep the contents super basic like below, or copy the contents of [the test-runner.js file in the v0.0.1 tagged release][repo-init-test-runner] which includes a setup for `axe-playwright`
    ```javascript
    // initial contents for test-runner.js

    const config = {
      async preVisit(page) {
        // content coming soon
      },
      async postVisit(page) {
        // content coming soon
      },
    };

    export default config;
    ```
1. Run your Storybook, then open a second terminal window and test it with the Test Runner. This will do a smoke test (does it render) on every story for all your components. If you have `play` tests, it will run those too.
    ```javascript
    npx test-storybook    
    ```

Did the tests run on all your stories? Great! **You are now set up similar to the v0.0.1 tagged release.** The next steps will detail what is in the v0.1.0 tagged release, which has the full NVDA and Voiceover functionality.

### Step 2: Run Guidepup's setup script

This command sets up Guidepup and NVDA/Voiceover to work together. See details about using this script at [@guidepup/setup][gpup-setup].

```javascript
npx @guidepup/setup
```

### Step 3: Install Guidepup's libraries

```javascript
npm i @guidepup/guidepup @guidepup/playwright -D
```

### Step 2: Generate `<root>/test-runner-jest.config.js` with `--eject`

Copypasta the [final version of `test-runner-jest.config.js` from the v0.1.0 tagged release][repo-merged-jest-config] or follow the steps below to create in your repo.

The _primary_ reason we need to add this file is to allow `launchOptions.headless` to be `false`. This allows local usage of Voiceover. (and maybe NVDA, your mileage may vary)

1. Auto-generate a `test-runner-jest.config.js` file at the root of your repo using the [Test Runner's eject command][sb-test-runner-eject].
    ```javascript
    npx test-storybook --eject
    ```
    This command will create a `test-runner-jest.config.js` file at the root of your repo similar to the below. Because I'm using plain js, it wrote the file as CommonJS
    ```javascript
    const { getJestConfig } = require('../dist');

    const testRunnerConfig = getJestConfig();

    module.exports = {
      ...testRunnerConfig,
    };
    ```
1. Change `test-runner-jest.config.js` to be ES6
    ```javascript
    // NOTE: changed to `@storybook/test-runner` from `../dist`
    import { getJestConfig } from "@storybook/test-runner";

    const testRunnerConfig = getJestConfig();

    export default {
      ...testRunnerConfig,
    };
    ```
1. Adjust to allow running tests HEADLESS, command-line browser config, and a longer timeout
    ```javascript
    import { getJestConfig } from "@storybook/test-runner";

    const testRunnerConfig = getJestConfig();
    // checks for `HEADLESS` variable in Node environment
    const headless = process.env.HEADLESS || false;

    export default {
      ...testRunnerConfig,
      testTimeout: 40000, // default timeout is 15s, now 40s
      testEnvironmentOptions: {
        'jest-playwright': {
          // line allows flags like `--browsers chromium` to work
          ...testRunnerConfig.testEnvironmentOptions["jest-playwright"],
          launchOptions: {
            headless,
          },
          maxWorkers: 1,
        },
      },
    };
    ```


[repo-initial-setup]: https://github.com/scottnath/screen-reader-storybook/tree/0.0.1
[repo-init-test-runner]: https://github.com/scottnath/screen-reader-storybook/blob/0.0.1/.storybook/test-runner.js
[repo-merged-jest-config]: https://github.com/scottnath/screen-reader-storybook/blob/0.1.0/test-runner-jest.config.js
[sb-test-runner-get-started]: https://github.com/storybookjs/test-runner?tab=readme-ov-file#getting-started
[sb-test-runner-hooks-api]: https://github.com/storybookjs/test-runner?tab=readme-ov-file#test-hooks-api
[sb-test-runner-eject]: https://github.com/storybookjs/test-runner?tab=readme-ov-file#ejecting-configuration
[sb-interaction-testing]: https://storybook.js.org/docs/writing-tests/interaction-testing
[gpup-setup]: https://github.com/guidepup/setup?tab=readme-ov-file#guidepup-setup