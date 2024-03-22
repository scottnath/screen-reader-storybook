
import { nvda } from "@guidepup/guidepup";

/**
 * Navigates to the jumplink injected via decorator in ./preview.js in the `wrapperDecorator`
 * This is inspired by the `nvdaPlaywright.navigateToWebContent` function found in guidepup's 
 *  Playwright library. @storybook/test-runner already has `describe.test` setup so it cannot use
 *  @guidepup/playwright directly 
 * @see https://github.com/guidepup/guidepup-playwright/blob/424e72768525d03720d104a72a62d9f96c0e9903/src/nvdaTest.ts#L123
 * @param {object} nvda - instance of guidepup nvda
 * @param {object} page - playwright page
 * @param {string} applicationName - current running app name
 */
export const navigateToWebContent = async (nvdaInstance, page, applicationName) => {
  await nvdaInstance.start();
  await page.bringToFront();
  await page.locator("#test-jumplink").waitFor();
  await page.locator("#test-jumplink").focus();
  await nvdaInstance.clearItemTextLog();
  await nvdaInstance.clearSpokenPhraseLog();
}

export const nvdaTest = async (page, appMapName, MAX_LOOP = 10) => {
  await navigateToWebContent(nvda, page, appMapName);
  let nextCount = 0;

  while (
    !(await nvda.lastSpokenPhrase()).includes('end of main content') &&
    nextCount <= MAX_LOOP
  ) {
    nextCount++;
    await nvda.next();
  }
  // await voiceOver.perform(voiceOver.commanderCommands.READ_CONTENTS_OF_WINDOW)
  console.log('AFTER the NEXT')
  const itemTextLog = await nvda.itemTextLog();
  console.log('itemTextLogAAA', JSON.stringify(itemTextLog, undefined, 2));
  itemTextLog.pop()
  let spokenPhraseLog = await nvda.spokenPhraseLog();
  spokenPhraseLog.pop();
  spokenPhraseLog = spokenPhraseLog.filter((phrase) => {
    return phrase !== '' && !phrase.includes('main content link') ;
  });
  console.log('itemTextLogBBB', JSON.stringify(itemTextLog, undefined, 2));
  console.log('spokenPhraseLog', JSON.stringify(spokenPhraseLog, undefined, 2));
  await nvda.stop();
  return itemTextLog;
}