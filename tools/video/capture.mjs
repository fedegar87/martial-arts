import {mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createInterface} from 'node:readline/promises';

process.env.PLAYWRIGHT_BROWSERS_PATH = '0';
const {chromium} = await import('playwright');
const targetUrl = process.argv[2] || 'http://localhost:3000';
const outputDirectory = resolve('work/captures', new Date().toISOString().replaceAll(':', '-'));
await mkdir(outputDirectory, {recursive: true});
const browser = await chromium.launch({headless: false});
const context = await browser.newContext({
  viewport: {width: 1440, height: 900},
  deviceScaleFactor: 1,
  reducedMotion: 'reduce',
  recordVideo: {dir: outputDirectory, size: {width: 1440, height: 900}},
});
const page = await context.newPage();
const terminal = createInterface({input: process.stdin, output: process.stdout});
try {
  await page.goto(targetUrl, {waitUntil: 'domcontentloaded'});
  console.log('Registrazione avviata. Accedi con un account demo e mostra il percorso tutorial.');
  await terminal.question('Premi Invio qui per terminare e salvare il video. ');
} finally {
  terminal.close();
  await context.close();
  await browser.close();
}
console.log(`Video salvato in ${outputDirectory}`);
