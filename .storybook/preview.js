
/**
 * Decorator adds a wrapper with a `jump to main content` link when `StorybookTestRunner`
 *  is present. This container is used by Playwright to get to the `body` and then have
 *  a generic element to focus on _before_ the component's HTML starts. The next focusable element 
 *  will be whatever the first focusable element is within a component
 * @see https://github.com/storybookjs/test-runner?tab=readme-ov-file#storybooktestrunner-user-agent
 */
const wrapperDecorator = (story) => {
  const isTestRunner = window.navigator.userAgent.match(/StorybookTestRunner/);
  let output;

  if (isTestRunner) {
    // Skip to content link
    const jumplink = document.createElement('a');
    jumplink.text = 'jump to main content';
    jumplink.setAttribute('href', '#story');
    jumplink.setAttribute('id', 'test-jumplink');
    // jumplink.setAttribute('aria-hidden', 'true');

    // Skip to content link
    const endlink = document.createElement('a');
    endlink.text = 'end of main content';
    endlink.setAttribute('href', '#test-jumplink');
    endlink.setAttribute('id', 'end-jumplink')

    // content anchor
    const anchor = document.createElement('a');
    anchor.setAttribute('name', 'story');

    // content container
    const container = document.createElement('div');
    container.appendChild(anchor)
    container.appendChild(story());

    // story page wrapper
    output = document.createElement('div');
    output.appendChild(jumplink.cloneNode(true))
    output.appendChild(container);
    output.appendChild(endlink);
  } else {
    output = story()
  }

  return output;
}

/** @type { import('@storybook/html').Preview } */
const preview = {
  decorators: [wrapperDecorator],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
