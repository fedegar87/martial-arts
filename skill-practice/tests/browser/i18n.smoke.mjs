import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const requireTools = createRequire(
  path.join(path.dirname(app), "tools/video/package.json"),
);
process.env.PLAYWRIGHT_BROWSERS_PATH = "0";
const { chromium } = requireTools("playwright");
const port = 3107;
const origin = `http://127.0.0.1:${port}`;
const server = spawn(
  process.execPath,
  [
    path.join(app, "node_modules/next/dist/bin/next"),
    "start",
    "-p",
    String(port),
    "-H",
    "127.0.0.1",
  ],
  { cwd: app, stdio: ["ignore", "pipe", "pipe"], windowsHide: true },
);
let output = "";
server.stdout.on("data", (data) => {
  output += data;
});
server.stderr.on("data", (data) => {
  output += data;
});
let browser;
try {
  const deadline = Date.now() + 30000;
  while (!output.includes("Ready")) {
    assert.equal(server.exitCode, null, output);
    assert.ok(Date.now() < deadline, output);
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  browser = await chromium.launch();
  const context = await browser.newContext({
    locale: "fr-BE",
    viewport: { width: 320, height: 740 },
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (
      message.type() === "error" &&
      /MISSING_MESSAGE|FORMATTING_ERROR|INVALID_MESSAGE/.test(message.text())
    )
      errors.push(message.text());
  });
  await page.goto(`${origin}/login`);
  assert.equal(await page.locator("html").getAttribute("lang"), "fr");
  await page
    .getByRole("button", { name: "Se connecter", exact: true })
    .waitFor();
  await page
    .getByText("Accédez à votre cahier technique numérique.", { exact: true })
    .waitFor();
  assert.equal(await page.getByRole("combobox").count(), 0);
  await page.reload();
  assert.equal(await page.locator("html").getAttribute("lang"), "fr");
  await page
    .getByRole("link", { name: "Mot de passe oublié ?", exact: true })
    .click();
  await page
    .getByRole("button", {
      name: "Envoyer le lien de réinitialisation",
      exact: true,
    })
    .waitFor();
  await page.goto(`${origin}/privacy`);
  await page
    .getByRole("heading", { name: "Confidentialité", exact: true })
    .waitFor();
  await page.getByText(/Le texte juridique original est en italien/).waitFor();
  assert.equal(await page.getByRole("combobox").count(), 0);
  assert.match(await page.title(), /Confidentialité/);
  await page.goto(origin);
  await page.getByRole("link", { name: "Entrer", exact: true }).waitFor();
  assert.equal(await page.locator("html").getAttribute("lang"), "fr");
  assert.equal(await page.getByRole("combobox").count(), 0);
  assert.match(
    await page.locator('meta[name="description"]').getAttribute("content"),
    /Pratique guidée/,
  );
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  );
  await page.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .filter(
          (animation) => animation.effect?.getTiming().iterations !== Infinity,
        )
        .map((animation) => animation.finished.catch(() => {})),
    ),
  );
  await fs.mkdir(path.join(app, "test-results/i18n"), { recursive: true });
  await page.screenshot({
    path: path.join(app, "test-results/i18n/landing-fr-320.png"),
    fullPage: true,
  });
  assert.deepEqual(errors, []);
  console.log(
    "PASS: actual Next.js SSR/hydration, French browser detection and reload, no language selector on public pages, French auth navigation and metadata, explicit legal fallback, 320px layout. No account or database writes.",
  );
} finally {
  await browser?.close();
  server.kill();
}
