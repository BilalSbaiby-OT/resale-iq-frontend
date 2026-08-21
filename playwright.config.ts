import { defineConfig, devices } from "@playwright/test"

const PORT = Number(process.env.E2E_PORT || 3100)
const BACKEND = process.env.BACKEND_URL || "http://127.0.0.1:8099"
const BASE = `http://localhost:${PORT}`

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL: BASE,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], channel: "chrome" },
    },
  ],
  webServer: [
    {
      command: "node e2e/mock-backend.mjs",
      url: `${BACKEND}/api/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 15_000,
    },
    {
      command: `npx next dev -p ${PORT}`,
      url: BASE,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: { ...process.env, BACKEND_URL: BACKEND },
    },
  ],
})
