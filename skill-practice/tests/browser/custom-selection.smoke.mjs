import assert from "node:assert/strict";
import fs from "node:fs/promises";
import http from "node:http";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Reuse the workspace's browser tooling; no app dependency or live account needed.
const app = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const workspace = path.dirname(app);
const requireTools = createRequire(
  path.join(workspace, "tools/video/package.json"),
);
process.env.PLAYWRIGHT_BROWSERS_PATH = "0";
const { build } = requireTools("esbuild");
const { chromium } = requireTools("playwright");
const temporary = await fs.mkdtemp(path.join(os.tmpdir(), "custom-selection-"));
const ids = [1, 2, 3, 4].map(
  (n) =>
    `${String(n).repeat(8)}-${String(n).repeat(4)}-${String(n).repeat(4)}-${String(n).repeat(4)}-${String(n).repeat(12)}`,
);
const [a, b, c, d] = ids;

await fs.writeFile(
  path.join(temporary, "actions.ts"),
  `
export async function saveCustomSelectionFromForm(previous, data) {
  window.__submitted = { discipline: data.get('discipline'), ids: data.getAll('skillIds') };
  if (window.__holdSave) return new Promise(resolve => { window.__finishSave = resolve; });
  return { success: true };
}
export async function deleteCustomSelection() { throw Error('Unexpected deletion'); }
`,
);
await fs.writeFile(
  path.join(temporary, "fixture.tsx"),
  `
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { NextIntlClientProvider } from 'next-intl';
import { CustomSelectionForm } from '@/components/plan/CustomSelectionForm';
const ids = ${JSON.stringify(ids)};
const skills = [
  { id: ids[0], name: 'Forma A', name_italian: 'Forma della gru', minimum_grade_value: 7 },
  { id: ids[1], name: 'Forma B', name_italian: null, minimum_grade_value: 6 },
  { id: ids[2], name: 'Forma C', name_italian: null, minimum_grade_value: 5 },
  { id: ids[3], name: 'Forma D', name_italian: null, minimum_grade_value: 4 },
];
const saved = JSON.parse(new URLSearchParams(location.search).get('saved') || '[]');
function Fixture() {
  const [discipline, setDiscipline] = useState('shaolin');
  window.__selectDiscipline = setDiscipline;
  return <main className="app-main"><h1>Selezione personale</h1><CustomSelectionForm
    discipline={discipline} selectedSkillIds={saved}
    groupedSkills={[[ 'forme', discipline === 'shaolin' ? skills.slice(0, 2) : skills.slice(2) ]]}
  /></main>;
}
createRoot(document.getElementById('root')).render(<NextIntlClientProvider locale="it" timeZone="Europe/Rome" messages={${JSON.stringify(JSON.parse(await fs.readFile(path.join(app, "src/lib/i18n/it.json"), "utf8")))}}><Fixture /></NextIntlClientProvider>);
`,
);
await build({
  entryPoints: [path.join(temporary, "fixture.tsx")],
  outfile: path.join(temporary, "bundle.js"),
  bundle: true,
  jsx: "automatic",
  platform: "browser",
  define: { "process.env.NODE_ENV": '"production"' },
  alias: {
    "@": path.join(app, "src"),
    react: path.join(app, "node_modules/react"),
    "react-dom": path.join(app, "node_modules/react-dom"),
    "next-intl": path.join(app, "node_modules/next-intl"),
    "@/lib/actions/plan": path.join(temporary, "actions.ts"),
  },
  logLevel: "silent",
});
const staticRoot = path.join(app, ".next/static");
const cssFiles = (await fs.readdir(staticRoot, { recursive: true })).filter(
  (file) => file.endsWith(".css"),
);
const css = (
  await Promise.all(
    cssFiles.map((file) => fs.readFile(path.join(staticRoot, file), "utf8")),
  )
).join("\n");
const fontClasses = [...css.matchAll(/\.([^{}\s]+)\{--font-[^}]+\}/g)]
  .map((match) => match[1])
  .join(" ");
const bundle = await fs.readFile(path.join(temporary, "bundle.js"));
const server = http.createServer(async (request, response) => {
  const pathname = new URL(request.url, "http://localhost").pathname;
  if (pathname === "/bundle.js") {
    response.setHeader("Content-Type", "text/javascript");
    return response.end(bundle);
  }
  if (pathname === "/style.css") {
    response.setHeader("Content-Type", "text/css");
    return response.end(css);
  }
  if (pathname.startsWith("/_next/static/")) {
    const file = path.resolve(
      staticRoot,
      pathname.slice("/_next/static/".length),
    );
    if (file.startsWith(staticRoot + path.sep)) {
      try {
        return response.end(await fs.readFile(file));
      } catch {
        /* Missing asset. */
      }
    }
    response.statusCode = 404;
    return response.end();
  }
  response.setHeader("Content-Type", "text/html;charset=utf-8");
  response.end(
    `<!doctype html><html lang="it" class="${fontClasses}"><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/style.css"></head><body><div id="root"></div><script src="/bundle.js"></script></body></html>`,
  );
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
let browser;
try {
  browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("**/*", (route) =>
    route.request().url().startsWith(origin) ? route.continue() : route.abort(),
  );
  const button = (name) => page.getByRole("button", { name, exact: true });
  const checkbox = (id) => page.locator(`input[type=checkbox][value="${id}"]`);
  const open = async (saved) => {
    await page.goto(
      `${origin}/?saved=${encodeURIComponent(JSON.stringify(saved))}`,
    );
    await button("Tutti").waitFor();
    await page.evaluate(() => document.fonts.ready);
  };
  const count = async (expected) =>
    assert.equal(
      await page.locator(".app-fixed-action strong").innerText(),
      String(expected),
    );
  const submit = async (expected, discipline = "shaolin") => {
    await page.evaluate(() => {
      window.__submitted = null;
    });
    await button("Salva piano").click();
    await page.waitForFunction(() => window.__submitted);
    const payload = await page.evaluate(() => window.__submitted);
    assert.equal(payload.discipline, discipline);
    assert.equal(
      payload.ids.length,
      new Set(payload.ids).size,
      "Duplicate submitted IDs",
    );
    assert.deepEqual([...payload.ids].sort(), [...expected].sort());
    return payload;
  };

  await open([c]);
  await count(0);
  assert.ok(await button("Salva piano").isDisabled());
  await button("7° Chi").click();
  await checkbox(a).check();
  await button("6° Chi").click();
  await checkbox(b).check();
  await count(2);
  await page.evaluate(() => {
    window.__holdSave = true;
  });
  await submit([a, b, c]);
  for (const control of await page
    .locator('form button, form input[type="checkbox"]')
    .all()) {
    assert.ok(await control.isDisabled(), "Editing must be locked during save");
  }
  await page.evaluate(() => window.__finishSave({ error: "Errore di prova" }));
  await page.getByText("Errore di prova", { exact: true }).waitFor();
  assert.ok(
    await checkbox(b).isChecked(),
    "A failed save must retain the checkbox state",
  );
  await button("7° Chi").click();
  assert.ok(await checkbox(a).isChecked());
  await checkbox(a).uncheck();
  await button("6° Chi").click();
  await page.evaluate(() => {
    window.__holdSave = false;
  });
  const saved = await submit([b, c]);
  await page.getByText("Selezione salvata.", { exact: true }).waitFor();

  // Reopen with the submitted IDs, as after a successful server save.
  await open(saved.ids);
  assert.equal(await checkbox(a).isChecked(), false);
  assert.ok(await checkbox(b).isChecked());
  await count(1);
  await page.evaluate(() => window.__selectDiscipline("taichi"));
  await checkbox(c).waitFor();
  assert.ok(await checkbox(c).isChecked());
  await count(1);

  await open([a, b, c]);
  await button("7° Chi").click();
  await page.evaluate(() => window.__selectDiscipline("taichi"));
  await checkbox(c).waitFor();
  assert.equal(await button("Tutti").getAttribute("aria-pressed"), "true");
  await count(1);
  await checkbox(d).check();
  await count(2);
  await submit([a, b, c, d], "taichi");
  await button("Salva piano").waitFor();
  await page.evaluate(() => window.__selectDiscipline("shaolin"));
  await checkbox(a).waitFor();
  assert.ok(await checkbox(a).isChecked());
  await count(2);
  await checkbox(a).uncheck();
  await button("6° Chi").click();
  await checkbox(b).uncheck();
  await count(0);
  assert.equal(await button("Salva piano").isDisabled(), false);
  await submit([c, d]);
  await button("Salva piano").waitFor();
  await page.evaluate(() => window.__selectDiscipline("taichi"));
  await checkbox(c).waitFor();
  assert.ok(await checkbox(c).isChecked());
  assert.ok(await checkbox(d).isChecked());
  await count(2);

  await open([a]);
  await checkbox(a).uncheck();
  await count(0);
  await submit([]);

  await open([]);
  assert.ok(await button("Salva piano").isDisabled());
  assert.equal(
    await page.getByRole("button", { name: /seleziona|deseleziona/i }).count(),
    0,
  );
  await checkbox(a).check();
  const output = path.join(app, "test-results/custom-selection");
  await fs.mkdir(output, { recursive: true });
  for (const width of [320, 375, 390]) {
    await page.setViewportSize({ width, height: 844 });
    await page.screenshot({
      path: path.join(output, `selection-${width}.png`),
      fullPage: true,
    });
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      JSON.stringify(
        await page.evaluate(() =>
          [...document.querySelectorAll("*")]
            .filter(
              (element) => element.getBoundingClientRect().right > innerWidth,
            )
            .map((element) => ({
              tag: element.tagName,
              classes: element.className,
              right: element.getBoundingClientRect().right,
            })),
        ),
      ),
    );
  }
  assert.deepEqual(errors, []);
  console.log(
    "PASS: cross-grade payload, no duplicates, manual deselection, scoped counts, discipline switching, empty save, pending/error recovery, reload, no added controls, mobile 320/375/390px.",
  );
  console.log(
    "Actual form and FormData exercised with mocked actions; no database writes. Screenshots: " +
      output,
  );
} finally {
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
  await fs.rm(temporary, { recursive: true, force: true });
}
