import { injectAxe, checkA11y } from "axe-playwright";

const config = {
  logLevel: 'warn',
  async preVisit(page) {
    await injectAxe(page);
  },
  async postVisit(page) {
    await checkA11y(page, "#storybook-root", {
      detailedReport: true,
      verbose: false,
    }, 'v2');
  },
};

export default config;