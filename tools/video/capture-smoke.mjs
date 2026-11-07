import {mkdir, stat} from 'node:fs/promises';
import {resolve} from 'node:path';

process.env.PLAYWRIGHT_BROWSERS_PATH = '0';
const {chromium} = await import('playwright');
const outputDirectory = resolve('work/capture-check');
await mkdir(outputDirectory, {recursive: true});
const browser = await chromium.launch();
try {
  const context = await browser.newContext({
    viewport: {width: 1440, height: 900},
    recordVideo: {dir: outputDirectory, size: {width: 1440, height: 900}},
  });
  const page = await context.newPage();
  const video = page.video();
  await page.setContent('<html lang="it"><body style="background:#151613;color:#d5b878;font:48px Arial"><h1>Skill Practice</h1><p>Collaudo registrazione browser</p></body></html>');
  await page.waitForTimeout(2000);
  await context.close();
  const videoPath = await video.path();
  const videoInfo = await stat(videoPath);
  if (videoInfo.size === 0) throw new Error('Registrazione vuota');
  console.log(`Registrazione verificata: ${videoPath} (${videoInfo.size} byte)`);
} finally {
  await browser.close();
}
