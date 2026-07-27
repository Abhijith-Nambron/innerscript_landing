import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const rootDir = process.cwd();
const auditStamp = new Date().toISOString().replace(/[:.]/g, '-');
const outputDir = path.join(rootDir, 'docs', 'audits', auditStamp);
const defaultUrl = 'http://127.0.0.1:4177/';
const auditUrl = process.env.AUDIT_URL || defaultUrl;
const tabs = [
  'live-recall',
  'timeline-replay',
  'source-stack'
];
const viewports = [
  { name: 'desktop', width: 1440, height: 1100 },
  { name: 'mobile', width: 390, height: 920 }
];

let devServer = null;
let devServerOutput = '';

async function main() {
  await mkdir(outputDir, { recursive: true });

  if (!process.env.AUDIT_URL) {
    const viteBin = path.join(rootDir, 'node_modules', 'vite', 'bin', 'vite.js');
    devServer = spawn(process.execPath, [viteBin, '--host', '127.0.0.1', '--port', '4177', '--strictPort'], {
      cwd: rootDir,
      stdio: 'pipe'
    });
    devServer.stdout.on('data', (chunk) => {
      devServerOutput += chunk.toString();
    });
    devServer.stderr.on('data', (chunk) => {
      devServerOutput += chunk.toString();
    });
    await waitForServer(auditUrl);
  }

  const browser = await chromium.launch();
  const allFindings = [];
  const screenshots = [];

  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport });
    const consoleErrors = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    page.on('pageerror', (error) => consoleErrors.push(error.message));

    await page.goto(auditUrl, { waitUntil: 'networkidle' });
    await page.route('https://script.google.com/**', (route) => route.abort());

    allFindings.push(...await inspectLandingBasics(page, viewport.name));
    allFindings.push(...await inspectFooterScrollTop(page, viewport.name));

    for (const tab of tabs) {
      await page.locator(`[data-preview-tab="${tab}"]`).click();
      await page.locator(`[data-preview-panel="${tab}"]`).waitFor({ state: 'visible' });
      const screenshotName = `${viewport.name}-${tabs.indexOf(tab) + 1}-${tab}.png`;
      await page.screenshot({ path: path.join(outputDir, screenshotName), fullPage: true });
      screenshots.push(screenshotName);
      allFindings.push(...await inspectPreviewState(page, viewport.name, tab));
    }

    if (consoleErrors.length) {
      allFindings.push({
        severity: 'High',
        area: 'Reliability',
        step: `${viewport.name} console`,
        finding: `Console errors appeared: ${consoleErrors.join(' | ')}`,
        recommendation: 'Fix runtime errors before judging visual polish.'
      });
    }

    await page.close();
  }

  await browser.close();
  await writeReport(allFindings, screenshots);
}

async function inspectLandingBasics(page, viewportName) {
  const findings = [];
  const archivedVisible = await page.locator('[data-archived]').evaluateAll((nodes) =>
    nodes.filter((node) => {
      const style = window.getComputedStyle(node);
      return style.display !== 'none' && style.visibility !== 'hidden';
    }).length
  );
  const visibleNavLinks = await page.locator('.nav-links a:visible').count();
  const heroNote = await page.locator('.hero-access-note').innerText();
  const hasForbiddenCloudCopy = await page.locator('body').innerText().then((text) =>
    text.includes('without sending data to public clouds') || text.includes('local-first')
  );

  if (archivedVisible > 0) {
    findings.push({
      severity: 'High',
      area: 'Flow',
      step: `${viewportName} archived sections`,
      finding: 'Archived sections are still visible, which makes the page feel overstuffed.',
      recommendation: 'Keep archived concepts out of the live reading path until they are ready.'
    });
  }

  if (!heroNote.includes('First 100') || !heroNote.includes('Founder Plan')) {
    findings.push({
      severity: 'High',
      area: 'CTA',
      step: `${viewportName} hero`,
      finding: 'The early-access scarcity and Founder Plan benefit are not both visible.',
      recommendation: 'Keep the CTA and footnote tightly paired in the hero.'
    });
  }

  if (hasForbiddenCloudCopy) {
    findings.push({
      severity: 'High',
      area: 'Wording',
      step: `${viewportName} copy`,
      finding: 'The page still contains stale local/cloud language.',
      recommendation: 'Replace it with source-backed and ownership language that matches the current product direction.'
    });
  }

  if (viewportName === 'mobile' && visibleNavLinks > 0) {
    findings.push({
      severity: 'Medium',
      area: 'Layout',
      step: 'mobile header',
      finding: 'Mobile nav links are visible and may crowd the header.',
      recommendation: 'Keep mobile header focused on brand and one CTA.'
    });
  }

  findings.push({
    severity: 'Medium',
    area: 'Wording',
    step: `${viewportName} first impression`,
    finding: 'The promise is emotionally strong, but the page still asks visitors to believe a sophisticated AI memory claim before they see proof.',
    recommendation: 'Let the concept preview quickly show source evidence, not only reflection copy.'
  });

  return findings;
}

async function inspectPreviewState(page, viewportName, tab) {
  const findings = [];
  const activeTabs = await page.locator('[data-preview-tab].active').count();
  const panelText = await page.locator(`[data-preview-panel="${tab}"]`).innerText();
  const overflowingElements = await page.locator('body *').evaluateAll((nodes) =>
    {
      if (document.documentElement.scrollWidth <= window.innerWidth + 2) return [];

      return nodes.filter((node) => {
      const style = window.getComputedStyle(node);
      const rect = node.getBoundingClientRect();
      if (node.closest('.sr-only')) return false;
      if (style.display === 'none' || style.visibility === 'hidden') return false;
      if (rect.width <= 1 || rect.height <= 1) return false;
      return node.scrollWidth > node.clientWidth + 2 && node.clientWidth > 0;
      }).slice(0, 12).map((node) => node.className || node.id || node.tagName);
    }
  );

  if (activeTabs !== 1) {
    findings.push({
      severity: 'High',
      area: 'Interaction',
      step: `${viewportName} ${tab}`,
      finding: `Expected one active preview tab, found ${activeTabs}.`,
      recommendation: 'Keep tab state singular so comparison does not feel broken.'
    });
  }

  if (panelText.length < 140) {
    findings.push({
      severity: 'High',
      area: 'Content',
      step: `${viewportName} ${tab}`,
      finding: 'The selected preview panel is too thin to explain the concept.',
      recommendation: 'Add enough concrete writing, reflection, and source detail to make the variation judgeable.'
    });
  }

  if (overflowingElements.length) {
    findings.push({
      severity: 'Medium',
      area: 'Layout',
      step: `${viewportName} ${tab}`,
      finding: `Potential horizontal overflow in: ${overflowingElements.join(', ')}.`,
      recommendation: 'Tighten widths, wrapping, or grid behavior before launch.'
    });
  }

  if (tab === 'timeline-replay') {
    findings.push({
      severity: 'Medium',
      area: 'Flow',
      step: `${viewportName} Timeline Replay`,
      finding: 'Timeline makes memory feel temporal, but it is less obvious where the user should click next.',
      recommendation: 'If chosen, add one clear action or inspection affordance per timeline point.'
    });
  }

  return findings;
}

async function inspectFooterScrollTop(page, viewportName) {
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.locator('[data-scroll-top]').click();
  await page.waitForFunction(() => window.scrollY <= 5, null, { timeout: 5000 });

  const scrollY = await page.evaluate(() => window.scrollY);
  if (scrollY > 5) {
    return [{
      severity: 'High',
      area: 'Interaction',
      step: `${viewportName} footer top link`,
      finding: `Go to top left the page at scrollY=${scrollY}.`,
      recommendation: 'Use a JS scroll-to-top handler instead of relying only on hash navigation.'
    }];
  }

  return [];
}

async function writeReport(findings, screenshots) {
  const severeFindings = findings.filter((finding) => finding.severity !== 'Low');
  const positives = [
    'The hero CTA is direct and the Founder Plan note is close to the signup field.',
    'The preview now gives multiple visual models instead of asking one demo to carry every idea.',
    'Archived sections are kept out of the visible flow when hidden correctly.'
  ];
  const report = `# InnerScript V3 Critical Page Audit

Generated: ${new Date().toISOString()}
URL: ${auditUrl}

## Screenshots

${screenshots.map((name) => `- ${name}`).join('\n')}

## Critical Findings

${severeFindings.map((finding, index) => `${index + 1}. **${finding.severity} / ${finding.area} / ${finding.step}**  
   ${finding.finding}  
   Recommendation: ${finding.recommendation}`).join('\n\n')}

## Positive Notes

${positives.map((note) => `- ${note}`).join('\n')}

## Limits

- This audit is script-generated and should be followed by human visual review.
- Screenshots can reveal layout and copy problems, but they do not prove full accessibility compliance.
- The signup endpoint was not exercised to avoid writing test entries to the live sheet.
`;

  await writeFile(path.join(outputDir, 'critical-page-audit.md'), report, 'utf8');
  console.log(`Audit saved to ${outputDir}`);
}

async function waitForServer(url) {
  const deadline = Date.now() + 30000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
  throw new Error(`Timed out waiting for ${url}\n\nDev server output:\n${devServerOutput.trim() || '(no output)'}`);
}

process.on('exit', () => {
  if (devServer) devServer.kill();
});

main().catch((error) => {
  if (devServer) devServer.kill();
  console.error(error);
  process.exit(1);
});
