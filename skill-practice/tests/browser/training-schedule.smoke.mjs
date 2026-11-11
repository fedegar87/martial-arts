import assert from "node:assert/strict";
import fs from "node:fs/promises";
import http from "node:http";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const requireTools = createRequire(path.join(path.dirname(app), "tools/video/package.json"));
process.env.PLAYWRIGHT_BROWSERS_PATH = "0";
const { build } = requireTools("esbuild");
const { chromium } = requireTools("playwright");
const temporary = await fs.mkdtemp(path.join(os.tmpdir(), "training-schedule-"));
const catalogs = Object.fromEntries(await Promise.all(["it", "fr"].map(async (locale) => [
  locale, JSON.parse(await fs.readFile(path.join(app, `src/lib/i18n/${locale}.json`), "utf8")),
])));
const today = "2026-11-11";
const fixedNow = new Date(`${today}T11:00:00Z`);
const baseSchedule = {
  user_id: "fixture-user", weekdays: [1, 3, 5], cadence_weeks: 2, reps_per_form: 3,
  exam_disciplines: ["shaolin", "taichi"], start_date: today, end_date: "2027-02-02",
  created_at: `${today}T11:00:00Z`, updated_at: `${today}T11:00:00Z`,
};
let browser;
let server;

try {
  await fs.writeFile(path.join(temporary, "actions.ts"), `
export async function setupTrainingSchedule(previous, data) {
  window.__submitted = {
    weekdays: data.getAll('weekdays').map(Number),
    cadence_weeks: Number(data.get('cadence_weeks')),
    reps_per_form: Number(data.get('reps_per_form')),
    duration_weeks: Number(data.get('duration_weeks')),
    exam_discipline_scope: data.get('exam_discipline_scope'),
  };
  if (window.__holdSave) return new Promise(resolve => { window.__finishSave = resolve; });
  return { success: true };
}
export async function updatePlanItemStatus(skillId, status) {
  window.__statusUpdates.push({ skillId, status });
  window.__persistStatus(skillId, status);
  return { success: true };
}
`);
  await fs.writeFile(path.join(temporary, "fixture.tsx"), `
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { NextIntlClientProvider } from 'next-intl';
import { SetupForm } from '@/components/sessions/SetupForm';
const config = JSON.parse(new URLSearchParams(location.search).get('fixture') || '{}');
const catalogs = ${JSON.stringify(catalogs)};
function makeItem(index, category = 'forme', status = 'focus') {
  const discipline = index < 7 ? 'shaolin' : 'taichi';
  const id = 'skill-' + index;
  return {
    id: 'plan-' + index, user_id: 'fixture-user', skill_id: id, status,
    source: config.planMode === 'custom' ? 'manual' : 'exam_program',
    is_hidden: false, last_practiced_at: null, added_at: '${today}T11:00:00Z',
    skill: {
      id, school_id: 'fixture-school', name: discipline + ' ' + category + ' ' + index,
      name_italian: null, discipline, category, practice_mode: 'solo', description: null,
      video_url: '', video_label: null, secondary_video_url: null, secondary_video_label: null,
      thumbnail_url: null, teacher_notes: null, estimated_duration_seconds: 180,
      minimum_grade_value: 2, is_extra: false, display_order: index, created_at: '${today}T11:00:00Z',
    },
  };
}
const initialItems = config.items === 'empty' ? [] : config.items === 'mixed' ? [
  makeItem(0, 'forme', 'focus'), makeItem(1, 'armi_forma', 'maintenance'),
  makeItem(7, 'tui_fa', 'focus'), makeItem(8, 'chin_na', 'maintenance'),
] : Array.from({ length: 14 }, (_, index) => makeItem(index));
window.__statusUpdates = [];
function Fixture() {
  const [items, setItems] = useState(initialItems);
  const [current, setCurrent] = useState(config.current ?? null);
  const [generation, setGeneration] = useState(0);
  window.__persistStatus = (id, status) => setItems(rows => rows.map(item => item.skill_id === id ? { ...item, status } : item));
  window.__reopenSaved = saved => { setCurrent(saved); setGeneration(value => value + 1); };
  const disciplineCounts = {
    shaolin: items.filter(item => item.skill.discipline === 'shaolin').length,
    taichi: items.filter(item => item.skill.discipline === 'taichi').length,
  };
  return <main className="app-main"><h1>Training fixture</h1><SetupForm key={generation}
    current={current} programLabel="Fixture: secondo Chi Shaolin e Tai Chi"
    planMode={config.planMode ?? 'exam'} disciplineCounts={disciplineCounts} items={items}
  /></main>;
}
const locale = config.locale ?? 'it';
createRoot(document.getElementById('root')).render(<NextIntlClientProvider locale={locale} timeZone="Europe/Rome" messages={catalogs[locale]}><Fixture /></NextIntlClientProvider>);
`);
  await build({
    entryPoints: [path.join(temporary, "fixture.tsx")],
    outfile: path.join(temporary, "bundle.js"), bundle: true, jsx: "automatic", platform: "browser",
    define: { "process.env.NODE_ENV": '"production"', "process.env.APP_TIME_ZONE": '"Europe/Rome"' },
    alias: {
      "@": path.join(app, "src"), react: path.join(app, "node_modules/react"),
      "react-dom": path.join(app, "node_modules/react-dom"), "next-intl": path.join(app, "node_modules/next-intl"),
      "@/lib/actions/training-schedule": path.join(temporary, "actions.ts"),
      "@/lib/actions/plan": path.join(temporary, "actions.ts"),
    },
    logLevel: "silent",
  });
  const staticRoot = path.join(app, ".next/static");
  const cssFiles = (await fs.readdir(staticRoot, { recursive: true })).filter((file) => file.endsWith(".css"));
  assert.ok(cssFiles.length > 0, "Run npm run build before the browser test; do not run both concurrently.");
  const css = (await Promise.all(cssFiles.map((file) => fs.readFile(path.join(staticRoot, file), "utf8")))).join("\n");
  const fontClasses = [...css.matchAll(/\.([^{}\s]+)\{--font-[^}]+\}/g)].map((match) => match[1]).join(" ");
  const bundle = await fs.readFile(path.join(temporary, "bundle.js"));
  server = http.createServer(async (request, response) => {
    const pathname = new URL(request.url, "http://localhost").pathname;
    if (pathname === "/bundle.js") { response.setHeader("Content-Type", "text/javascript"); return response.end(bundle); }
    if (pathname === "/style.css") { response.setHeader("Content-Type", "text/css"); return response.end(css); }
    if (pathname.startsWith("/_next/static/")) {
      const asset = path.resolve(staticRoot, pathname.slice("/_next/static/".length));
      if (asset.startsWith(staticRoot + path.sep)) {
        try { return response.end(await fs.readFile(asset)); } catch { /* Missing asset. */ }
      }
      response.statusCode = 404;
      return response.end();
    }
    response.setHeader("Content-Type", "text/html;charset=utf-8");
    response.end(`<!doctype html><html class="${fontClasses}"><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/style.css"></head><body><div id="root"></div><script src="/bundle.js"></script></body></html>`);
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, timezoneId: "Europe/Rome" });
  await page.clock.setFixedTime(fixedNow);
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("**/*", (route) => route.request().url().startsWith(origin) ? route.continue() : route.abort());
  let locale = "it";
  const messages = () => catalogs[locale].ui;
  const button = (key) => page.getByRole("button", { name: messages()[key], exact: true });
  const input = (name) => page.locator(`input[name="${name}"]`);
  const chooseRadio = async (name, value) => {
    await page.locator("label").filter({ has: page.locator(`input[name="${name}"][value="${value}"]`) }).click();
  };
  const open = async (fixture = {}) => {
    locale = fixture.locale ?? "it";
    await page.goto(`${origin}/?fixture=${encodeURIComponent(JSON.stringify(fixture))}`);
    await button("generateSessions").waitFor();
    await page.evaluate(() => document.fonts.ready);
    assert.equal(
      await input("cadence_weeks").first().evaluate((node) => getComputedStyle(node).position),
      "absolute",
      "The actual build CSS must style the setup controls.",
    );
  };
  const preview = async (count, minutes) => {
    const expected = messages().sessionPreview.replace("{minutes}", String(minutes)).replace("{count}", String(count));
    await page.getByText(expected, { exact: true }).waitFor();
  };
  const setWeekdays = async (selected) => {
    const keys = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
    for (const [index, key] of keys.entries()) {
      const active = await button(key).getAttribute("aria-pressed") === "true";
      if (active !== selected.includes(index + 1)) await button(key).click();
    }
  };
  const setReps = async (target) => {
    let value = Number(await input("reps_per_form").inputValue());
    while (value !== target) {
      await button(value < target ? "increase" : "decrease").click();
      value = Number(await input("reps_per_form").inputValue());
    }
  };
  const submit = async () => {
    await page.evaluate(() => { window.__submitted = null; });
    await button("generateSessions").click();
    await page.waitForFunction(() => window.__submitted);
    return page.evaluate(() => window.__submitted);
  };
  const expectUntil = async (isoDate) => {
    const date = new Date(`${isoDate}T00:00:00Z`).toLocaleDateString(messages().locale, {
      day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
    });
    await page.getByText(`${messages().until} ${date}.`, { exact: true }).waitFor();
  };

  await open();
  assert.deepEqual(await input("weekdays").evaluateAll((nodes) => nodes.map((node) => Number(node.value))), [1, 3, 5]);
  assert.ok(await page.locator('input[name="cadence_weeks"][value="2"]').isChecked());
  assert.equal(await input("duration_weeks").inputValue(), "12");
  assert.equal(await input("reps_per_form").inputValue(), "3");
  await preview(5, 42);
  await expectUntil("2027-02-02");
  for (const [key, weeks, until] of [
    ["oneMonth", 4, "2026-12-08"], ["twoMonths", 8, "2027-01-05"],
    ["threeMonths", 12, "2027-02-02"], ["sixMonths", 24, "2027-04-27"],
  ]) {
    await button(key).click();
    assert.equal(await input("duration_weeks").inputValue(), String(weeks));
    await expectUntil(until);
  }
  await setWeekdays([1, 2, 3, 4, 5, 6, 7]);
  for (const [cadence, count, minutes] of [[1, 4, 36], [2, 2, 18], [4, 1, 9]]) {
    await chooseRadio("cadence_weeks", cadence);
    await preview(count, minutes);
  }
  await setWeekdays([1]);
  await chooseRadio("cadence_weeks", 1);
  await preview(14, 126);
  await setWeekdays([]);
  assert.ok(await button("generateSessions").isDisabled());
  await preview(0, 0);
  await page.getByText(messages().selectDay, { exact: true }).waitFor();

  await open({ current: { ...baseSchedule, weekdays: [2, 4, 7], cadence_weeks: 4, reps_per_form: 8, exam_disciplines: ["taichi"] } });
  assert.ok(await page.locator('input[name="exam_discipline_scope"][value="taichi"]').isChecked());
  assert.equal(await page.getByRole("radiogroup").count(), 7);
  assert.ok(await page.locator('input[name="cadence_weeks"][value="4"]').isChecked());
  assert.equal(await input("reps_per_form").inputValue(), "8");
  await setWeekdays([1, 4, 6]);
  await button("twoMonths").click();
  await chooseRadio("cadence_weeks", 1);
  await setReps(5);
  await chooseRadio("exam_discipline_scope", "shaolin");
  const payload = await submit();
  assert.deepEqual(payload, { weekdays: [1, 4, 6], cadence_weeks: 1, reps_per_form: 5, duration_weeks: 8, exam_discipline_scope: "shaolin" });
  await page.evaluate((current) => window.__reopenSaved(current), {
    ...baseSchedule, ...payload, exam_disciplines: ["shaolin"], end_date: "2027-01-05",
  });
  await page.locator('input[name="exam_discipline_scope"][value="shaolin"]').waitFor();
  assert.ok(await page.locator('input[name="exam_discipline_scope"][value="shaolin"]').isChecked());
  assert.deepEqual(await input("weekdays").evaluateAll((nodes) => nodes.map((node) => Number(node.value))), [1, 4, 6]);
  assert.equal(await input("duration_weeks").inputValue(), "8");
  assert.equal(await input("reps_per_form").inputValue(), "5");

  await open({ planMode: "custom", current: { ...baseSchedule, exam_disciplines: ["shaolin"] } });
  assert.equal(await input("exam_discipline_scope").inputValue(), "both");
  assert.equal(await page.getByRole("radiogroup").count(), 14);
  assert.equal(await page.locator('input[type="radio"][name="exam_discipline_scope"]').count(), 0);
  await preview(5, 42);

  for (const testLocale of ["it", "fr"]) {
    await open({ locale: testLocale, items: "mixed", current: { ...baseSchedule, weekdays: [1], cadence_weeks: 1 } });
    for (let reps = 1; reps <= 10; reps++) {
      await setReps(reps);
      await preview(4, 6 * reps + 6);
    }
    await button("increase").click();
    assert.equal(await input("reps_per_form").inputValue(), "10");
    await setReps(1);
    await button("decrease").click();
    assert.equal(await input("reps_per_form").inputValue(), "1");

    await setWeekdays([1, 3, 5]);
    await chooseRadio("cadence_weeks", 1);
    await preview(2, 6);
    await chooseRadio("exam_discipline_scope", "shaolin");
    assert.equal(await page.getByRole("radiogroup").count(), 2);
    await preview(1, 3);
    await chooseRadio("exam_discipline_scope", "taichi");
    assert.equal(await page.getByRole("radiogroup").count(), 2);
    await preview(1, 3);
    await chooseRadio("exam_discipline_scope", "both");
    await preview(2, 6);
    await page.getByRole("radio", { name: messages().maintenanceFor.replace("{p0}", "shaolin forme 0"), exact: true }).click();
    await page.waitForFunction(() => window.__statusUpdates.length === 1);
    await preview(2, 5);
    assert.deepEqual(await page.evaluate(() => window.__statusUpdates), [{ skillId: "skill-0", status: "maintenance" }]);
    await page.evaluate((current) => window.__reopenSaved(current), { ...baseSchedule, weekdays: [1, 3, 5], cadence_weeks: 1, reps_per_form: 1 });
    await preview(2, 5);
    assert.equal(await page.getByRole("radio", { name: messages().maintenanceFor.replace("{p0}", "shaolin forme 0"), exact: true }).getAttribute("aria-checked"), "true");
  }

  await open({ items: "empty" });
  await preview(0, 0);
  assert.equal(await page.getByRole("radiogroup").count(), 0);
  const output = path.join(app, "test-results/training-schedule");
  await fs.mkdir(output, { recursive: true });
  await open({ locale: "fr", items: "mixed" });
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 844 });
    await page.screenshot({ path: path.join(output, `setup-${width}.png`), fullPage: true });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Horizontal overflow at ${width}px`);
  }
  assert.deepEqual(errors, []);
  console.log("PASS: actual SetupForm defaults/save/reopen; 14 forms, cycles 1/2/4, daily/single-day/zero-day schedules; durations 4/8/12/24 with inclusive end dates; reps 1..10 and category-specific minutes; custom/exam discipline scopes; persisted status updates; empty plan; Italian/French; mobile 320/390px.");
  console.log(`Actions simulated; no account, network services or database writes. Screenshots: ${output}`);
} finally {
  await browser?.close();
  if (server) await new Promise((resolve) => server.close(resolve));
  const resolvedTemporary = path.resolve(temporary);
  if (path.dirname(resolvedTemporary) !== path.resolve(os.tmpdir()) || !path.basename(resolvedTemporary).startsWith("training-schedule-")) {
    throw Error("Refusing cleanup outside the task temporary directory");
  }
  await fs.rm(resolvedTemporary, { recursive: true, force: true });
}
