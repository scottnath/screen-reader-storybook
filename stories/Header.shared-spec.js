import { expect, within, userEvent } from '@storybook/test';
import { virtual } from '@guidepup/virtual-screen-reader';

/**
 * Extract elements from an HTMLElement
 */
export const getElements = async (canvasElement) => {
  const screen = within(canvasElement);
  const buttons = await screen.queryAllByRole('button');
  const title = await screen.queryByRole('heading', { name: /Acme/i });

  return {
    screen,
    buttons,
    title,
    header: title?.closest('header'),
  };
}

/**
 * Extract the expected screen reader spoken output for virtual screen reader
 * @param {Object} args - a content object representing a GitHub repository
 * @returns {string[]} - array of strings representing the expected screen reader output
 */
export const getExpectedScreenText = (args) => {
  // What we expect the screen reader to say
  return [
    'banner',
    // it is an `<h1>`, so `heading level 1`
    'heading level 1 Acme',
    // Using `args` here allows you to change args without breaking the test
    `Welcome, ${args.user.name}!`,
    'Log out button',
    'end of banner'
  ];
}

/**
 * Ensure the screen reader reads the correct content
 */
export const ensureScreenRead = async (elements, args) => {
  const buttonName = args.label ? args.label : 'Button';
  const expected = getExpectedScreenTextVirtual(args);

  let nextCount = 0;
  const MAX_NAVIGATION_LOOP = expected.length + 3;
  // Start virtual screen reader
  await virtual.start({ container: elements.button });
  while (
    !(await virtual.lastSpokenPhrase()).includes(expected[expected.length - 1]) &&
    nextCount <= MAX_NAVIGATION_LOOP
  ) {
    nextCount++;
    await virtual.next();
  }
  const phraseLog = await virtual.spokenPhraseLog();
  // Stop virtual screen reader
  await virtual.stop();

  // Compare spoken phrases to expected
  expect(phraseLog.length).toEqual(expected.length);
  for (let i = 0; i < phraseLog.length; i++) {
    expect(phraseLog[i]).toEqual(expected[i]);
  }
}
