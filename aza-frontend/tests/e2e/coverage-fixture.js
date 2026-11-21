import { test as base, expect } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const v8ToIstanbul = require('v8-to-istanbul');
const { createCoverageMap } = require('istanbul-lib-coverage');

export const test = base.extend({
  measuredCoverage: [async ({ page }, use, testInfo) => {
    if (process.env.AZA_COVERAGE !== '1') { await use(); return; }
    await page.coverage.startJSCoverage({ resetOnNavigation: false });
    await use();
    const entries = await page.coverage.stopJSCoverage();
    const map = createCoverageMap({});
    for (const entry of entries) {
      if (!entry.url || !entry.source) continue;
      const url = new URL(entry.url);
      if (!url.pathname.startsWith('/src/') || !/\.[cm]?[jt]sx?$/.test(url.pathname)) continue;
      const sourcePath = path.resolve(process.cwd(), '.' + decodeURIComponent(url.pathname));
      const converter = v8ToIstanbul(sourcePath, 0, { source: entry.source });
      await converter.load();
      converter.applyCoverage(entry.functions);
      map.merge(converter.toIstanbul());
    }
    await fs.writeFile(testInfo.outputPath('coverage.json'), JSON.stringify(map.toJSON()));
  }, { auto: true }],
});
export { expect };
