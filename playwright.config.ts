import { defineConfig } from '@playwright/test';
import { randomBytes } from 'node:crypto';
process.env.QA_STAFF_KEY ??= randomBytes(32).toString('hex');
export default defineConfig({
  testDir: './tests',
  workers: 1,
  fullyParallel: false,
  timeout: 45000,
  use: {
    baseURL: 'http://localhost:3312',
    channel: process.env.PLAYWRIGHT_CHANNEL,
    trace: 'retain-on-failure',
  },
  webServer: [
    {
      command: 'node tests/serve-api.mjs',
      url: 'http://127.0.0.1:4312/v1/health',
      timeout: 90000,
    },
    {
      command: 'npm start -- --hostname 127.0.0.1 --port 3312',
      url: 'http://localhost:3312/staff',
      env: { API_URL: 'http://127.0.0.1:4312' },
      timeout: 60000,
    },
  ],
});
