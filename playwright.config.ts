import { defineConfig, devices } from '@playwright/test';
import { randomInt } from 'crypto';
import * as os from "os";

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
import { config } from 'dotenv';
import * as path from 'path';
import tearDown from 'tests/config/global-teardown';
config({ path: path.resolve(__dirname, '.env') });

const currentDateTime = new Date().toISOString().replace(/[:.]/g, "_").slice(0, -1);
const outputFolder = `C:/Temp/test-results/results-${currentDateTime}`;
tearDown
/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env['CI'],
  /* Retry on CI only */
  retries: process.env['CI'] ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env['CI'] ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    // ['html', { outputFolder: outputFolder+'/html' ,printSteps:true}],
    ["allure-playwright",{
      detail: true,
      suiteTitle: false,
      outputFolder: "allure-results",
      environmentInfo: {
        os_platform: os.platform(),
        os_release: os.release(),
        os_version: os.version(),
        node_version: process.version,
      },
    },]
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    //baseURL: '',
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on',
    screenshot: 'on',
    video:'retain-on-failure',
    launchOptions: {
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      args: ['--start-maximized'],
    },
  },
  expect: {
    timeout: 10 * 1000, //30 sec to locate element
  },
  timeout: 2 * 60 * 1000,//10 mins
  /* Configure projects for major browsers */
  projects: [
    {
      name: 'nabarun_dev',
      use: {
        headless:false,
        browserName: 'chromium',
        baseURL: process.env['BASE_URL'],
        viewport: null
      },
    },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
