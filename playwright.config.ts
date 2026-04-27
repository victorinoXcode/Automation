import {
  defineConfig,
  devices,
  type ReporterDescription,
} from "@playwright/test";

import {env} from "./tests/commons/env";

function parseOptionalInteger(value: string | undefined) {
  if (!value) {
    return undefined;
  }

  const parsedValue = Number(value);
  return Number.isInteger(parsedValue) ? parsedValue : undefined;
}

function parseOptionalBoolean(value: string | undefined) {
  if (!value) {
    return undefined;
  }

  return value.toLowerCase() === "true";
}

const qaseEnabled =
  env.QASE_MODE === "testops" &&
  Boolean(env.QASE_TOKEN && env.QASE_PROJECT) &&
  !process.argv.includes("--list");

const qaseRunId = parseOptionalInteger(process.env.QASE_TESTOPS_RUN_ID);
const qaseRunTitle =
  process.env.QASE_TESTOPS_RUN_TITLE ??
  `Playwright Run ${new Date().toISOString().slice(0, 19).replace("T", " ")}`;
const qaseRunComplete =
  parseOptionalBoolean(process.env.QASE_TESTOPS_RUN_COMPLETE) ?? true;

/** User Management spec runs only in system-management-chromium; exclude from chromium/webkit/Mobile Safari */
const ignoreUserManagement = /system-management[/\\]user-management[/\\]/;
const faafSpecs = /core[/\\]faaf[/\\].*\.spec\.ts$/;
const ignoreSeedSpec = /(^|[/\\])seed\.spec\.ts$/;
const ignoreSetupTests = /\.setup\.ts$/;

/** Reporters: list (consola) + html (report) + playwright-qase-reporter si QASE_MODE=testops */
const reporters: ReporterDescription[] = [
  ["list"],
  ["html"],
  ["junit", {outputFile: "test-results/junit.xml"}],
];
if (qaseEnabled) {
  reporters.push([
    "playwright-qase-reporter",
    {
      // playwright-qase-reporter v2 usa "testops" (no apiToken/projectCode planos)
      // Equivalente: apiToken → testops.api.token, projectCode → testops.project, runComplete → testops.run.complete
      testops: {
        api: {token: env.QASE_TOKEN},
        project: env.QASE_PROJECT,
        run: {
          id: qaseRunId,
          title: qaseRunTitle,
          complete: qaseRunComplete,
        },
      },
    },
  ]);
}

/**
 * See https://playwright.dev/docs/test-configuration.
 * Qase: https://developers.qase.io/docs/playwright
 */
export default defineConfig({
  testDir: "./tests",
  testIgnore: ignoreSeedSpec,
  globalSetup: "./global.setup.ts",
  timeout: 60_000,
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!env.CI || false,
  /* Retry on CI only */
  retries: env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: env.CI ? 1 : "80%",
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: reporters,
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    // baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  /* Projects for major browsers */
  projects: [
    // Subset of tests for different QA procedures
    {
      name: "Regression",
      testMatch: /.*regre.spec.ts/,
      retries: 0,
      testIgnore: ignoreSetupTests,
    },
    {
      name: "Default",
      testIgnore: [/.*\.spec\.ts$/, ignoreSetupTests],
      retries: 0,
    },

    /* Desktop viewports. */
    {
      name: "chromium",
      testMatch: faafSpecs,
      testIgnore: [ignoreSetupTests, ignoreUserManagement],
      use: {...devices["Desktop Chrome"]},
    },
    {
      name: "webkit",
      testIgnore: [ignoreSetupTests, ignoreUserManagement, faafSpecs],
      use: {...devices["Desktop Safari"]},
    },

    /* Mobile viewports. */
    // {
    //   name: "Mobile Chrome",
    //   use: {...devices["Pixel 7"]},
    // },
    {
      name: "Mobile Safari",
      testIgnore: [ignoreSetupTests, ignoreUserManagement, faafSpecs],
      use: {...devices["iPhone 15"]},
    },

    /* System Management (dashboard) — Chromium only; only PM + ZPO auth */
    {
      name: "system-management-chromium",
      testIgnore: ignoreSetupTests,
      testMatch: /system-management[/\\]user-management[/\\].*\.spec\.ts$/,
      use: {...devices["Desktop Chrome"]},
    },
  ],
});
