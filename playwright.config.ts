import { defineConfig, devices } from "@playwright/test";
import { existsSync } from "node:fs";

const APP_URL = "http://127.0.0.1:4173/tu-jubilacion/";
const CHROME_PATH =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const launchOptions = existsSync(CHROME_PATH)
  ? {
      executablePath: CHROME_PATH,
      args: ["--no-sandbox"],
    }
  : {
      args: ["--no-sandbox"],
    };

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    ...devices["Desktop Chrome"],
    baseURL: APP_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    launchOptions,
  },
  webServer: {
    command: "npm run preview -- --host 127.0.0.1 --port 4173",
    url: APP_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
