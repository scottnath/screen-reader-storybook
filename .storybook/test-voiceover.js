import { macOSActivate, voiceOver } from "@guidepup/guidepup";

/**
 * Navigates to the jumplink injected via decorator in ./preview.js in the `wrapperDecorator`
 * This is inspired by the `voiceOverPlaywright.navigateToWebContent` function found in guidepup's 
 *  Playwright library. @storybook/test-runner already has `describe.test` setup so it cannot use
 *  @guidepup/playwright directly 
 * @see https://github.com/guidepup/guidepup-playwright/blob/424e72768525d03720d104a72a62d9f96c0e9903/src/voiceOverTest.ts#L86
 * @param {object} vo - instance of guidepup voiceOver
 * @param {object} page - playwright page
 * @param {string} appMapName - current running app name
 */
export const navigateToWebContent = async (vo, page, appMapName) => {
  await vo.start({ capture: 'initial' });
  // Ensure application is brought to front and focused.
  await macOSActivate(appMapName);

  // Ensure the document is ready and focused.
  await page.bringToFront();
  await page.locator("#test-jumplink").waitFor();
  await page.locator("#test-jumplink").focus();
  await vo.perform(vo.commanderCommands.MOVE_KEYBOARD_FOCUS_TO_VOICEOVER_CURSOR)
  await vo.perform(vo.commanderCommands.MOVE_MOUSE_POINTER_TO_VOICEOVER_CURSOR)

  // Clear out logs.
  await vo.clearItemTextLog();
  await vo.clearSpokenPhraseLog();
}

/**
 * Read the content of the component using VoiceOver
 * @param {object} page - playwright page
 * @param {string} appMapName - current running app name
 * @param {number} MAX_LOOP - maximum number of .next() iterations
 * @returns {string[]} - array of strings representing the spoken phrases
 */
export const voiceOverReader = async (page, appMapName, MAX_LOOP = 10) => {
  await navigateToWebContent(voiceOver, page, appMapName);
  let nextCount = 0;

  while (
    !(await voiceOver.lastSpokenPhrase()).includes('end of main content') &&
    nextCount <= MAX_LOOP
  ) {
    nextCount++;
    await voiceOver.next();
  }
  const itemTextLog = await voiceOver.itemTextLog();
  itemTextLog.pop();
  await voiceOver.stop();
  return itemTextLog;
}