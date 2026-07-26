import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import path from 'node:path';

const rootDir = process.cwd();
const testUrl = process.env.LAYOUT_TEST_URL || 'http://127.0.0.1:4178/';
const minimumNavbarGap = 48;
const viewports = [
  { width: 1024, height: 768 },
  { width: 1025, height: 600 },
  { width: 1280, height: 600 },
  { width: 1280, height: 720 },
  { width: 1366, height: 768 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
];

const viteBin = path.join(rootDir, 'node_modules', 'vite', 'bin', 'vite.js');
const devServer = process.env.LAYOUT_TEST_URL
  ? null
  : spawn(
      process.execPath,
      [viteBin, '--host', '127.0.0.1', '--port', '4178', '--strictPort'],
      {
        cwd: rootDir,
        stdio: 'pipe',
      },
    );

let serverOutput = '';
devServer?.stdout.on('data', (chunk) => {
  serverOutput += chunk.toString();
});
devServer?.stderr.on('data', (chunk) => {
  serverOutput += chunk.toString();
});

try {
  await waitForServer();
  const browser = await chromium.launch();

  try {
    for (const viewport of viewports) {
      const page = await browser.newPage({ viewport });
      await page.route('https://**', (route) => route.abort());
      await page.goto(testUrl, { waitUntil: 'domcontentloaded' });
      await page.evaluate(() => document.fonts.ready);

      const layout = await page.evaluate(() => {
        const getBox = (selector) => {
          const element = document.querySelector(selector);
          if (!element) throw new Error(`Missing layout element: ${selector}`);
          return element.getBoundingClientRect().toJSON();
        };

        const header = getBox('.app-header');
        const title = getBox('.hero-title');
        const subtitle = getBox('.hero-subtitle');
        const form = getBox('.hero-access-form');

        return {
          navbarGap: title.top - header.bottom,
          subtitleFormGap: form.top - subtitle.bottom,
          titleOverlapsNavbar: title.top < header.bottom,
          formOverlapsSubtitle: form.top < subtitle.bottom,
        };
      });

      assert(
        !layout.titleOverlapsNavbar && layout.navbarGap >= minimumNavbarGap,
        `${formatViewport(viewport)} navbar gap was ${layout.navbarGap.toFixed(1)}px; expected at least ${minimumNavbarGap}px`,
      );
      assert(
        !layout.formOverlapsSubtitle,
        `${formatViewport(viewport)} signup form overlapped the subtitle by ${Math.abs(layout.subtitleFormGap).toFixed(1)}px`,
      );

      await page.close();
    }

    const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
    await page.route('https://**', (route) => route.abort());
    await page.goto(testUrl, { waitUntil: 'domcontentloaded' });

    const copyContracts = await page.evaluate(() => ({
      firstHundredUnderlined: Boolean(document.querySelector('.hero-access-note u')),
      variationCaptionPresent: Boolean(document.querySelector('#preview-decision-note')),
      journalLabel: document.querySelector('.outliner-panel .panel-title')?.textContent?.trim(),
      sourcesActivePresent: document.body.textContent?.includes('SOURCES ACTIVE'),
    }));

    assert(!copyContracts.firstHundredUnderlined, 'First 100 must not be underlined');
    assert(!copyContracts.variationCaptionPresent, 'Preview variation caption must stay removed');
    assert(copyContracts.journalLabel === 'journal / today', `Unexpected journal label: ${copyContracts.journalLabel}`);
    assert(!copyContracts.sourcesActivePresent, 'SOURCES ACTIVE label must stay removed');
    await page.close();
  } finally {
    await browser.close();
  }

  console.log(`Layout regression passed across ${viewports.length} desktop viewports.`);
} finally {
  devServer?.kill('SIGTERM');
}

async function waitForServer() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    if (devServer?.exitCode !== null && devServer?.exitCode !== undefined) {
      throw new Error(`Vite exited before the test started.\n${serverOutput}`);
    }

    try {
      const response = await fetch(testUrl);
      if (response.ok) return;
    } catch {
      // Vite is still starting.
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error(`Timed out waiting for ${testUrl}.\n${serverOutput}`);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function formatViewport(viewport) {
  return `${viewport.width}x${viewport.height}`;
}
