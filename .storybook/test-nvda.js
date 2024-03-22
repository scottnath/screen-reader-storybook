
import { nvda, WindowsKeyCodes, WindowsModifiers, windowsActivate } from "@guidepup/guidepup";

const MAX_APPLICATION_SWITCH_RETRY_COUNT = 10;

const SWITCH_APPLICATION = {
  keyCode: [WindowsKeyCodes.Escape],
  modifiers: [WindowsModifiers.Alt],
};

const MOVE_TO_TOP = {
  keyCode: [WindowsKeyCodes.Home],
  modifiers: [WindowsModifiers.Control],
};

const focusBrowser = async ({
  applicationName,
  nvdaInstance,
}) => {
  console.log('focusBrowser', applicationName);
  await nvdaInstance.perform(nvdaInstance.keyboardCommands.reportTitle);
  let windowTitle = await nvdaInstance.lastSpokenPhrase();

  console.log('focusBrowserwindowTitle', windowTitle);
  if (windowTitle.includes(applicationName)) {
    return;
  }

  let applicationSwitchRetryCount = 0;

  while (applicationSwitchRetryCount < MAX_APPLICATION_SWITCH_RETRY_COUNT) {
    applicationSwitchRetryCount++;

    await nvdaInstance.perform(SWITCH_APPLICATION);
    await nvdaInstance.perform(nvdaInstance.keyboardCommands.reportTitle);
    windowTitle = await nvdaInstance.lastSpokenPhrase();
    console.log('WHILE windowTitle', windowTitle);

    if (windowTitle.includes(applicationName)) {
      break;
    }
  }
  console.log('focusBrowserwindowTitle222', windowTitle);
};



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

  await page.waitForSelector('#test-jumplink');
  console.log('page.waitForSelector', 'AFTER navigateToWebContent');
  await nvdaInstance.start({ capture: 'initial' });
  await nvdaInstance.perform(nvdaInstance.keyboardCommands.reportTitle);
  console.log('AAA await nvdaInstance.lastSpokenPhrase()', await nvdaInstance.lastSpokenPhrase());
  // Make sure NVDA is not in focus mode.
  await nvdaInstance.perform(
    nvdaInstance.keyboardCommands.exitFocusMode
  );
  // Ensure application is brought to front and focused.
  await focusBrowser({ applicationName, nvdaInstance });
  await page.locator("#test-jumplink").waitFor();
  await page.locator("#test-jumplink").focus();
  await nvdaInstance.clearItemTextLog();
  await nvdaInstance.clearSpokenPhraseLog();
}

export const nvdaTest = async (page, appMapName, MAX_LOOP = 10, ctx) => {
  console.log('nvdaTest');
  await page.goto("http://localhost:6006/iframe.html?args=&id="+ctx.id, { waitUntil: "load" });
  await page.bringToFront();
  await page.locator("body").waitFor();
  await page.locator("body").focus();
  await navigateToWebContent(nvda, page, appMapName);
  console.log('nvdaTest', 'AFTER navigateToWebContent');
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