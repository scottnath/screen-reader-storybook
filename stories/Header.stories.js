import { fn } from '@storybook/test';

import { createHeader } from './Header';
import { getElements, ensureScreenRead, getExpectedScreenText } from './Header.shared-spec.js'

export default {
  title: 'Example/Header',
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  render: (args) => createHeader(args),
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/configure/story-layout
    layout: 'fullscreen',
  },
  args: {
    onLogin: fn(),
    onLogout: fn(),
    onCreateAccount: fn(),
  }
};

export const LoggedIn = {
  tags: ['a11y2'],
  args: {
    user: {
      name: 'Jane Doe',
    },
  },
  play: async ({ canvasElement, args }) => {
    const elements = await getElements(canvasElement);
    await ensureScreenRead(elements, args);
  },
};
LoggedIn.parameters = {
  a11y: getExpectedScreenText(LoggedIn.args)
}

export const LoggedOut = {};
