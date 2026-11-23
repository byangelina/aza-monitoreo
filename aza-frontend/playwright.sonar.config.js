import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e',
  testMatch: ['sonar-regression.spec.js', 'app.spec.js'],
  workers: 1,
  reporter: [['list'], ['json', { outputFile: '../../browser-tests.json' }]],
  use: { baseURL: 'http://127.0.0.1:5175', headless: true, channel: 'msedge', viewport: { width: 1440, height: 1000 }, trace: 'retain-on-failure' },
  webServer: { command: 'npm run dev -- --port 5175 --strictPort', url: 'http://127.0.0.1:5175', reuseExistingServer: false },
});
