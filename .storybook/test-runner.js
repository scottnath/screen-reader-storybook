import { injectAxe, checkA11y } from "axe-playwright";
import { getStoryContext, waitForPageReady } from '@storybook/test-runner';
import { macOSActivate, voiceOver } from "@guidepup/guidepup";
import { applicationNameMap } from "@guidepup/playwright/lib/applicationNameMap.js";

/**
 * Navigates to the jumplink injected via decorator in ./preview.js in the `wrapperDecorator`
 * This is inspired by the `voiceOverPlaywright.navigateToWebContent` function found in guidepup's 
 *  Playwright library. @storybook/test-runner already has `describe.test` setup so it cannot use
 *  @guidepup/playwright directly 
 * @see https://github.com/guidepup/guidepup-playwright/blob/424e72768525d03720d104a72a62d9f96c0e9903/src/voiceOverTest.ts#L86
 * @param {object} vo - instance of guidepup voiceOver
 * @param {string} applicationName - current running app name
 */
const navigateToWebContent = async (vo, applicationName) => {
  // await voiceOver.start({ capture: 'initial' });
  await voiceOver.start({ capture: 'initial' });
  // Ensure application is brought to front and focused.
  await macOSActivate(applicationName);

  // Ensure the document is ready and focused.
  await page.bringToFront();
  // await page.locator("body").waitFor();
  // await page.locator("body").focus();

  // Navigate to the beginning of the web content.
  // await voiceOverPlaywright.interact();
  // await voiceOverPlaywright.perform(
  //   voiceOverPlaywright.keyboardCommands.jumpToLeftEdge
  // );
  await page.locator("#test-jumplink").waitFor();
  await page.locator("#test-jumplink").focus();

  // Clear out logs.
  await vo.clearItemTextLog();
  await vo.clearSpokenPhraseLog();
}

const config = {
  logLevel: 'warn',
  tags: {
    include: ['a11y2'],
  },
  async preVisit(page) {
    const READER = process.env.READER;
    if (!READER) {
      await injectAxe(page);
    }
  },
  async postVisit(page, story) {
    const READER = process.env.READER;
    if (!READER) {
      await checkA11y(page, "#storybook-root", {
        detailedReport: true,
        verbose: false,
      }, 'v2');
      return;
    }
    const applicationName = page.context().browser().browserType().name();

    console.log('page, story', story)
    const ctx = await getStoryContext(page, story);
    console.log('story context', ctx);
    const expectedScreenText = ctx.parameters.a11y;
    await waitForPageReady(page);
    await navigateToWebContent(voiceOver, applicationNameMap[applicationName]);
    let nextCount = 0;
    const MAX_NAVIGATION_LOOP = expectedScreenText.length + 3;

    while (
      !(await voiceOver.lastSpokenPhrase()).includes('end of main content') &&
      nextCount <= MAX_NAVIGATION_LOOP
    ) {
      nextCount++;
      await voiceOver.next();
    }
    // await voiceOver.perform(voiceOver.commanderCommands.READ_CONTENTS_OF_WINDOW)
    console.log('AFTER the NEXT')
    const itemTextLog = await voiceOver.itemTextLog();
    console.log('itemTextLogAAA', JSON.stringify(itemTextLog, undefined, 2));
    itemTextLog.pop()
    let spokenPhraseLog = await voiceOver.spokenPhraseLog();
    spokenPhraseLog.pop();
    spokenPhraseLog = spokenPhraseLog.filter((phrase) => phrase !== '');
    console.log('itemTextLogBBB', JSON.stringify(itemTextLog, undefined, 2));
    console.log('spokenPhraseLog', JSON.stringify(spokenPhraseLog, undefined, 2));
    await voiceOver.stop();
    // expect(spokenPhraseLog).toEqual(expectedScreenText);
    // Compare spoken phrases to expected
    expect(spokenPhraseLog.length).toEqual(expectedScreenText.length);
    for (let i = 0; i < spokenPhraseLog.length; i++) {
      expect(spokenPhraseLog[i]).toEqual(expectedScreenText[i]);
    }
  },
};

export default config;