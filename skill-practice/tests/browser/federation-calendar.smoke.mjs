import assert from "node:assert/strict";
import fs from "node:fs/promises";
import http from "node:http";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const requireTools = createRequire(
  path.join(path.dirname(app), "tools/video/package.json"),
);
process.env.PLAYWRIGHT_BROWSERS_PATH = "0";
const { build } = requireTools("esbuild");
const { chromium } = requireTools("playwright");
const temporary = await fs.mkdtemp(
  path.join(os.tmpdir(), "federation-calendar-"),
);
const screenshots = path.join(app, "test-results/federation-calendar");
await fs.mkdir(screenshots, { recursive: true });
await fs.writeFile(
  path.join(temporary, "actions.ts"),
  `
async function record(name, data) {
  (window.__calls ??= []).push({ name, data });
  if (window.__hold && name === 'enableEvent') return new Promise(resolve => window.__finish = resolve);
  return { success: true };
}
export const enableFederationEventReminder = data => record('enableEvent', data);
export const disableFederationEventReminder = data => record('disableEvent', data);
export const enableTrainingReminders = data => record('enableTraining', data);
export const disableTrainingReminders = data => record('disableTraining', data);
export const updateTrainingReminderSettings = data => record('saveTime', data);
export const setLocale = data => record('setLocale', data);
export const addFreePracticeForDate = () => { throw Error('Unexpected practice mutation'); };
export const removeFreePracticeForDate = addFreePracticeForDate;
export const setPracticeCompletionForDate = addFreePracticeForDate;
`,
);
await fs.writeFile(
  path.join(temporary, "push.ts"),
  `
export const getPushSupportState = () => window.__support ?? 'supported';
export const pushSupportErrorMessage = () => 'Installa l’app per attivare le notifiche.';
export const subscribeToPushNotifications = async () => { window.__subscribed = true; return { endpoint: 'fixture' }; };
export const unsubscribeFromPushNotifications = async () => { throw Error('Disabling training must preserve event subscriptions'); };
`,
);
await fs.writeFile(
  path.join(temporary, "link.tsx"),
  `
import React from 'react';
export default function Link({ prefetch, children, ...props }) { return <a {...props}>{children}</a>; }
`,
);
await fs.writeFile(
  path.join(temporary, "navigation.ts"),
  `export const useRouter = () => ({ refresh() {} });`,
);
await fs.writeFile(
  path.join(temporary, "fixture.tsx"),
  `
import React from 'react';
import { createRoot } from 'react-dom/client';
import { NextIntlClientProvider } from 'next-intl';
import { Calendar } from '@/components/calendar/Calendar';
import { AppHeader } from '@/components/shared/AppHeader';
import { TrainingReminderSettings } from '@/components/profile/TrainingReminderSettings';
import { FeskLandingHero } from '@/components/landing/FeskLandingHero';
import { buildCalendarDayViewsInRange } from '@/lib/calendar-logic';
const params = new URLSearchParams(location.search);
const locale = params.get('locale') === 'fr' ? 'fr' : 'it';
const catalogs = ${JSON.stringify(Object.fromEntries(await Promise.all(["it", "fr"].map(async (locale) => [locale, JSON.parse(await fs.readFile(path.join(app, `src/lib/i18n/${locale}.json`), "utf8"))]))))};
const base = { id: '11111111-1111-4111-8111-111111111111', title: 'Allenamento Cinture Nere',
  description: params.has('long') ? 'Dettaglio molto lungo '.repeat(800) : 'Programma ufficiale della federazione.',
  location: 'Palestra Mojazza, Milano', starts_on: '2026-11-21', ends_on: '2026-11-21',
  starts_at: '2026-11-21T08:30:00Z', ends_at: '2026-11-21T11:30:00Z',
  all_day: false, cancelled: params.has('cancelled'), reminderSelected: params.has('selected'), canRemind: !params.has('past') && !params.has('cancelled') };
const multi = { ...base, id: '22222222-2222-4222-8222-222222222222', title: 'Stage di più giorni', starts_on: '2026-11-20', ends_on: '2026-11-22', all_day: true };
const days = buildCalendarDayViewsInRange('2026-11-16', '2026-11-22', {
  rows: [], logs: [], skillById: new Map(), todayKey: '2026-11-07', repsPerForm: 1,
  hasSchedule: false, scheduleStart: null, scheduleEnd: null,
}).map(day => ({ ...day, events: [base, multi].filter(e => e.starts_on <= day.date && e.ends_on >= day.date) }));
const mode = params.get('mode');
createRoot(document.getElementById('root')).render(<NextIntlClientProvider locale={locale} messages={catalogs[locale]} timeZone="Europe/Rome">{mode === 'landing' ? <FeskLandingHero ctaHref="/login" /> : <>
  <AppHeader />
  <main className="app-main">{mode === 'profile' ? <TrainingReminderSettings publicVapidKey="fixture" hasSchedule={!params.has('noSchedule')}
    settings={{ enabled: !params.has('disabled'), activeSubscriptionCount: 1, reminderTime: '09:00', timeZone: 'Europe/Rome', includeExerciseNames: true }} /> :
    <><h1 className="mb-5 text-2xl">Calendario</h1><Calendar view="week" selectedDate="2026-11-21" days={days}
      periodLabel="16–22 novembre 2026" previousDate="2026-11-14" nextDate="2026-11-28" publicVapidKey={params.has('noKey') ? '' : 'fixture'} /></>}
  </main>
</>}</NextIntlClientProvider>);
`,
);
await build({
  entryPoints: [path.join(temporary, "fixture.tsx")],
  outfile: path.join(temporary, "bundle.js"),
  bundle: true,
  jsx: "automatic",
  platform: "browser",
  define: { "process.env.NODE_ENV": '"production"', "process.env": "{}" },
  alias: {
    "@": path.join(app, "src"),
    react: path.join(app, "node_modules/react"),
    "react-dom": path.join(app, "node_modules/react-dom"),
    "next-intl": path.join(app, "node_modules/next-intl"),
    "next/navigation": path.join(temporary, "navigation.ts"),
    "next/link": path.join(temporary, "link.tsx"),
    "@/lib/push-client": path.join(temporary, "push.ts"),
    ...Object.fromEntries(
      ["calendar", "federation-events", "push-notifications", "locale"].map(
        (name) => [`@/lib/actions/${name}`, path.join(temporary, "actions.ts")],
      ),
    ),
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
const fonts = [...css.matchAll(/\.([^{}\s]+)\{--font-[^}]+\}/g)]
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
  for (const [prefix, root] of [
    ["/_next/static/", staticRoot],
    ["/icons/", path.join(app, "public/icons")],
  ]) {
    if (!pathname.startsWith(prefix)) continue;
    const file = path.resolve(root, pathname.slice(prefix.length));
    if (file.startsWith(root + path.sep)) {
      try {
        return response.end(await fs.readFile(file));
      } catch {
        /* Missing fixture asset. */
      }
    }
    response.statusCode = 404;
    return response.end();
  }
  response.setHeader("Content-Type", "text/html;charset=utf-8");
  response.end(
    `<!doctype html><html lang="it" class="dark ${fonts}"><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/style.css"></head><body><div id="root"></div><script src="/bundle.js"></script></body></html>`,
  );
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
let browser;
try {
  browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    timezoneId: "Europe/Rome",
  });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("**/*", (route) =>
    route.request().url().startsWith(origin) ? route.continue() : route.abort(),
  );
  const button = (name) => page.getByRole("button", { name, exact: true });
  const settle = () =>
    page.evaluate(() =>
      Promise.all(
        document
          .getAnimations()
          .filter(
            (animation) =>
              animation.effect?.getTiming().iterations !== Infinity,
          )
          .map((animation) => animation.finished.catch(() => {})),
      ),
    );
  const open = async (query = "") => {
    await page.goto(`${origin}/?${query}`);
    await page
      .waitForFunction(
        () => document.querySelector("#root")?.childElementCount > 0,
        null,
        { timeout: 10000 },
      )
      .catch(() => {
        throw new Error(`Fixture did not render: ${errors.join("; ")}`);
      });
    await page.evaluate(() => document.fonts.ready);
  };
  const event = () =>
    page.getByRole("button", { name: /Allenamento Cinture Nere/ });
  const close = async () => {
    await button("Chiudi").click();
    await page.getByRole("dialog").waitFor({ state: "hidden" });
  };
  const noOverflow = async () =>
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      "Horizontal overflow",
    );
  await open();
  await event().click();
  await page
    .getByRole("dialog")
    .getByText(/09:30–12:30/)
    .waitFor();
  assert.equal(
    await page
      .getByRole("link", { name: "Calendario ufficiale" })
      .getAttribute("href"),
    "https://www.feskfongttai.it/la-f-e-s-k/eventi/calendario.html",
  );
  await button("Ricordamelo").click();
  await button("Rimuovi promemoria").waitFor();
  await button("Rimuovi promemoria").click();
  await button("Ricordamelo").waitFor();
  assert.deepEqual(
    await page.evaluate(() => window.__calls.map((c) => c.name)),
    ["enableEvent", "disableEvent"],
  );
  assert.ok(await page.evaluate(() => window.__subscribed));
  await close();
  assert.equal(
    await event().evaluate((element) => document.activeElement === element),
    true,
    "Focus returns to the event",
  );
  assert.equal(
    await page.locator('a[aria-label*="2 eventi federali"]').count(),
    1,
  );
  await page.getByRole("button", { name: /Stage di più giorni/ }).click();
  await page
    .getByRole("dialog")
    .getByText(/20 novembre 2026 – 22 novembre 2026/)
    .waitFor();
  await close();
  await page.evaluate(() => {
    window.__support = "ios-install-required";
  });
  await event().click();
  await button("Ricordamelo").click();
  await page.getByRole("alert").waitFor();
  await close();
  await page.evaluate(() => {
    window.__support = "supported";
    window.__hold = true;
  });
  await event().click();
  await button("Ricordamelo").click();
  await button("Salvataggio...").waitFor();
  await close();
  await page.evaluate(() => window.__finish({ error: "Errore di prova" }));
  await page.getByRole("alert").getByText("Errore di prova").waitFor();
  await close();
  await open("selected&cancelled");
  await event().click();
  await button("Rimuovi promemoria").click();
  await page.getByRole("status").waitFor();
  assert.equal(await button("Ricordamelo").count(), 0);
  for (const query of ["past", "noKey"]) {
    await open(query);
    await event().click();
    assert.equal(await button("Ricordamelo").count(), 0);
    await close();
  }
  await open("selected&noKey");
  await event().click();
  await button("Rimuovi promemoria").click();
  await page.getByRole("status").waitFor();
  assert.equal(await button("Ricordamelo").count(), 0);
  await open("mode=profile");
  await page.locator("summary").click();
  await button("Disattiva").click();
  await button("Attiva").waitFor();
  await page.locator('input[type="time"]').fill("10:15");
  await button("Salva orario promemoria").click();
  await page.getByText("Orario aggiornato.", { exact: true }).waitFor();
  assert.deepEqual(
    await page.evaluate(() => window.__calls.map((c) => c.name)),
    ["disableTraining", "saveTime"],
  );
  assert.match(
    await page.locator("summary").innerText(),
    /Allenamento disattivato · 10:15/,
  );
  await open("mode=profile&disabled&noSchedule");
  await page.locator("summary").click();
  assert.ok(await button("Attiva").isDisabled());
  assert.equal(await button("Salva orario promemoria").isDisabled(), false);
  for (const [width, height] of [
    [320, 740],
    [390, 844],
    [844, 390],
  ]) {
    await page.setViewportSize({ width, height });
    await open();
    await noOverflow();
    for (const name of ["Torna alla home", "Bacheca"]) {
      const box = await page
        .getByRole("link", { name, exact: true })
        .boundingBox();
      assert.ok(box.width >= 48 && box.height >= 48);
    }
    await page.screenshot({
      path: path.join(screenshots, `calendar-${width}.png`),
      fullPage: true,
    });
    await event().click();
    await settle();
    await noOverflow();
    await page.screenshot({
      path: path.join(screenshots, `event-${width}.png`),
      fullPage: true,
    });
    await close();
    await open("long");
    await event().click();
    await settle();
    const box = await page.getByRole("dialog").boundingBox();
    assert.ok(
      box.y >= 0 && box.height <= height - 11,
      `Long details remain inside the viewport: ${JSON.stringify({ width, height, box })}`,
    );
    await noOverflow();
    await close();
    await open("mode=landing");
    await page.getByRole("link", { name: "Entra", exact: true }).waitFor();
    await settle();
    await noOverflow();
    assert.equal(
      await page
        .getByRole("link", { name: "Entra", exact: true })
        .getAttribute("data-slot"),
      "button",
    );
    const enterBox = await page
      .getByRole("link", { name: "Entra", exact: true })
      .boundingBox();
    await page.screenshot({
      path: path.join(screenshots, `landing-${width}.png`),
      fullPage: true,
    });
    assert.ok(
      enterBox.y >= 0 && enterBox.y + enterBox.height <= height,
      `Landing CTA remains visible without scrolling: ${JSON.stringify({ width, height, enterBox })}`,
    );
  }
  await page.setViewportSize({ width: 320, height: 740 });
  await open("locale=fr");
  await page
    .getByRole("link", { name: "Retour à l’accueil", exact: true })
    .waitFor();
  await page.getByRole("link", { name: "Actualités", exact: true }).waitFor();
  await event().click();
  await button("Me le rappeler").waitFor();
  await settle();
  await noOverflow();
  await page.screenshot({
    path: path.join(screenshots, "event-fr-320.png"),
    fullPage: true,
  });
  await button("Me le rappeler").click();
  await button("Supprimer le rappel").waitFor();
  await page.getByRole("button", { name: "Fermer", exact: true }).click();
  await open("mode=profile&locale=fr&disabled");
  await page.locator("summary").click();
  await button("Activer").waitFor();
  await button("Enregistrer l’heure des rappels").waitFor();
  await noOverflow();
  assert.deepEqual(errors, []);
  console.log(
    "PASS: event details, Italy times, multiple-day display, opt-in/removal, focus return, iOS guidance, pending/error recovery, cancellation, independent training settings, mobile/landscape overflow and shared landing controls.",
  );
  console.log(
    `Actual components with mocked actions/push; no account, database writes or real notifications. Screenshots: ${screenshots}`,
  );
} finally {
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
  await fs.rm(temporary, { recursive: true, force: true });
}
