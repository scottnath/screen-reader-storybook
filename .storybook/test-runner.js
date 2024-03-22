import { injectAxe, checkA11y } from "axe-playwright";
import { getStoryContext, waitForPageReady } from '@storybook/test-runner';

import { applicationNameMap } from "@guidepup/playwright/lib/applicationNameMap.js";

import { voiceOverReader } from "./test-voiceover";
import { nvdaTest } from "./test-nvda";

const tags = [];
const READER = process.env.READER;
READER && tags.push('a11y');

/**
 * Storybook test-runner configuration
 * @see https://storybook.js.org/docs/writing-tests/test-runner#configure
 */
const config = {
  logLevel: 'warn',
  tags: {
    include: tags,
  },
  async preVisit(page) {
    if (!READER) {
      await injectAxe(page);
    }
  },
  async postVisit(page, story) {
    if (!READER) {
      await checkA11y(page, "#storybook-root", {
        detailedReport: true,
        verbose: false,
      }, 'v2');
      return;
    }
    const applicationName = page.context().browser().browserType().name();
    const appMapName = applicationNameMap[applicationName];
    expect(appMapName).toBeDefined();

    console.log('page, story', story)
    const ctx = await getStoryContext(page, story);
    console.log('story context', ctx);
    const expectedScreenText = ctx.parameters.a11y;
    await waitForPageReady(page);
    let itemTextLog = [];
    if (READER === 'nvda') {
      itemTextLog = await nvdaTest(page, appMapName, expectedScreenText.length + 3);
    } else {
      itemTextLog = await voiceOverReader(page, appMapName, expectedScreenText.length + 3);
    }

    expect(itemTextLog).toEqual(expectedScreenText);
  },
};

export default config;