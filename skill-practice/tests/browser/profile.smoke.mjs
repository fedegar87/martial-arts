import assert from "node:assert/strict";
import fs from "node:fs/promises";
import http from "node:http";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const requireTools = createRequire(
  path.join(path.dirname(app), "tools/video/package.json"),
);
process.env.PLAYWRIGHT_BROWSERS_PATH = "0";
const { build } = requireTools("esbuild");
const { chromium } = requireTools("playwright");
const results = path.join(app, "test-results");
await fs.mkdir(results, { recursive: true });
const temporary = await fs.mkdtemp(path.join(results, "profile-fixture-"));
const screenshots = path.join(results, "profile");
await fs.mkdir(screenshots, { recursive: true });
const catalogs = Object.fromEntries(
  await Promise.all(
    ["it", "fr"].map(async (locale) => [
      locale,
      JSON.parse(
        await fs.readFile(
          path.join(app, `src/lib/i18n/${locale}.json`),
          "utf8",
        ),
      ),
    ]),
  ),
);
await fs.writeFile(
  path.join(temporary, "queries.ts"),
  `
import {buildCalendarDayViewsInRange} from '@/lib/calendar-logic';
export const getCurrentProfileAccount = async () => ({
  id: 'fixture', school_id:'school-fixture', display_name: 'Nome di collaudo', email: 'allievo@example.test', school_name: 'Scuola di collaudo',
  role: 'student', assigned_level_shaolin: 5, assigned_level_taichi: 0, profile_locked: true, plan_mode: 'exam', created_at: '2026-01-01T12:00:00Z'
});
export const getTrainingSchedule = async () => null;
export const getPendingAccountDeletionRequest = async () => null;
export const getTrainingReminderSettings = async () => ({enabled:false, activeSubscriptionCount:0, reminderTime:'09:00', timeZone:'Europe/Rome', includeExerciseNames:true});
export const getCurrentProfile = getCurrentProfileAccount;
export const listNewsForSchool = async () => window.__scenario === 'empty' ? [] : [{
  id:'news-1', type:'announcement', pinned:true, title:'Avviso di collaudo', body:'Comunicazione della scuola. '.repeat(12), published_at:'2026-11-01T12:00:00Z'
}];
const events = Array.from({length:4}, (_,i) => ({
  id:'event-'+i, title:'Stage di collaudo '+i, description:'Dettagli dello stage', location:'Arlon',
  starts_on:'2026-12-0'+(i+1), ends_on:'2026-12-0'+(i+2), starts_at:'2026-12-0'+(i+1)+'T09:00:00Z',
  ends_at:'2026-12-0'+(i+2)+'T16:00:00Z', all_day:false, cancelled:false, reminderSelected:false, canRemind:true
}));
export const getFederationCalendarData = async () => ({events:window.__scenario === 'empty' ? [] : events, unavailable:window.__scenario === 'unavailable', reminderTime:'09:00'});
export const getCalendarSkillOptions = async () => [];
export const getCalendarDataInRange = async ({from,to}) => ({
  days:buildCalendarDayViewsInRange(from,to,{rows:[],logs:[],skillById:new Map(),todayKey:'2026-11-08',repsPerForm:1,hasSchedule:false,scheduleStart:null,scheduleEnd:null}).map(day=>({...day, events:[]})),
  eventsUnavailable:false,eventReminderTime:'09:00'
});
`,
);
await fs.writeFile(
  path.join(temporary, "actions.ts"),
  `
export async function setLocale(value) {
  (window.__calls ??= []).push(value);
  if (window.__hold) await new Promise(resolve => window.__finish = resolve);
  if (window.__fail) throw Error('Fixture save failure');
  window.__locale = value;
}
const unexpected = async () => { throw Error('Unexpected account mutation'); };
export const markNewsAsSeen = async () => { window.__seen = (window.__seen ?? 0) + 1; };
export { unexpected as changePassword, unexpected as signOut, unexpected as requestAccountDeletion,
  unexpected as updateProfileGrade, unexpected as switchToCustomMode, unexpected as revokePushSubscriptionOnSignOut,
  unexpected as enableTrainingReminders, unexpected as disableTrainingReminders, unexpected as updateTrainingReminderSettings,
  unexpected as addFreePracticeForDate, unexpected as removeFreePracticeForDate, unexpected as setPracticeCompletionForDate,
  unexpected as enableFederationEventReminder, unexpected as disableFederationEventReminder };
`,
);
await fs.writeFile(
  path.join(temporary, "intl.ts"),
  `
import {createTranslator} from 'next-intl';
export const getLocale = async () => window.__locale;
export const getTranslations = async namespace => createTranslator({locale:window.__locale, messages:window.__catalogs[window.__locale], namespace});
`,
);
await fs.writeFile(
  path.join(temporary, "navigation.ts"),
  `
export const useRouter = () => ({refresh: () => { void window.__render(); }});
export const usePathname = () => location.pathname === '/' ? '/profile' : location.pathname;
export const redirect = () => { throw Error('Unexpected redirect'); };
`,
);
await fs.writeFile(
  path.join(temporary, "link.tsx"),
  `
import React from 'react';
export default function Link({prefetch, children, ...props}) {return <a {...props}>{children}</a>;}
`,
);
await fs.writeFile(
  path.join(temporary, "fixture.tsx"),
  `
import React from 'react';
import {createRoot} from 'react-dom/client';
import {NextIntlClientProvider} from 'next-intl';
import ProfilePage from '@/app/(app)/profile/page';
import NewsPage from '@/app/(app)/news/page';
import CalendarPage from '@/app/(app)/calendar/page';
import {AppHeaderConditional} from '@/components/shared/AppHeaderConditional';
import {BottomNav} from '@/components/nav/BottomNav';
window.__catalogs = ${JSON.stringify(catalogs)};
window.__locale = new URLSearchParams(location.search).get('locale') ?? (document.cookie.includes('fixture_locale=fr') ? 'fr' : 'it');
document.cookie = 'fixture_locale='+window.__locale+';path=/';
window.__scenario = new URLSearchParams(location.search).get('scenario');
const root = createRoot(document.getElementById('root'));
window.__render = async () => {
  const content = location.pathname === '/news' ? await NewsPage() : location.pathname === '/calendar' ? await CalendarPage({searchParams:Promise.resolve(Object.fromEntries(new URLSearchParams(location.search)))}) : await ProfilePage();
  document.documentElement.lang = window.__locale;
  root.render(<NextIntlClientProvider locale={window.__locale} messages={window.__catalogs[window.__locale]} timeZone="Europe/Rome">
    <div className="app-shell bg-background"><AppHeaderConditional/><main className="app-main">{content}</main><BottomNav/></div>
  </NextIntlClientProvider>);
};
void window.__render();
`,
);
await build({
  entryPoints: [path.join(temporary, "fixture.tsx")],
  outfile: path.join(temporary, "bundle.js"),
  bundle: true,
  jsx: "automatic",
  platform: "browser",
  logLevel: "silent",
  define: {
    "process.env.NODE_ENV": '"production"',
    "process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY": '"fixture"',
    "process.env": "{}",
  },
  alias: {
    "@": path.join(app, "src"),
    react: path.join(app, "node_modules/react"),
    "react-dom": path.join(app, "node_modules/react-dom"),
    "next-intl/server": path.join(temporary, "intl.ts"),
    "next-intl": path.join(app, "node_modules/next-intl"),
    "next/navigation": path.join(temporary, "navigation.ts"),
    "next/link": path.join(temporary, "link.tsx"),
    ...Object.fromEntries(
      [
        "user-profile",
        "training-schedule",
        "account",
        "push-notifications",
        "news",
        "federation-events",
        "calendar",
      ].map((name) => [
        `@/lib/queries/${name}`,
        path.join(temporary, "queries.ts"),
      ]),
    ),
    ...Object.fromEntries(
      [
        "profile",
        "auth",
        "account",
        "plan",
        "push-notifications",
        "locale",
        "news",
        "calendar",
        "federation-events",
      ].map((name) => [
        `@/lib/actions/${name}`,
        path.join(temporary, "actions.ts"),
      ]),
    ),
  },
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
    `<!doctype html><html lang="it" class="dark ${fonts}"><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/style.css"></head><body><div id="root"></div><script src="/bundle.js"></script></body></html>`,
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
  const panel = (title) =>
    page
      .locator("details")
      .filter({ has: page.locator("summary").filter({ hasText: title }) });
  const noOverflow = async () =>
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    );
  await page.goto(origin);
  await page.getByRole("heading", { name: "Nome di collaudo" }).waitFor();
  assert.equal(await page.locator("header.material-bar select").count(), 0);
  assert.equal(
    await page
      .locator(
        'main a[href="/calendar"], main a[href="/sessions/setup"], main a[href="/programma"], main a[href="/plan/exam"]',
      )
      .count(),
    0,
  );
  assert.equal(await panel(/^Programma|^Programme/).count(), 0);
  assert.equal(await page.locator("main details").count(), 5);
  const language = panel(/^Lingua/);
  assert.equal(await language.locator("summary").innerText(), "Lingua");
  await language.locator("summary").click();
  const select = page.getByRole("combobox", { name: "Lingua", exact: true });
  assert.equal(await select.inputValue(), "it");
  await page.evaluate(() => {
    window.__hold = true;
  });
  await select.selectOption("fr");
  assert.equal(await select.isDisabled(), true);
  await page.evaluate(() => {
    window.__hold = false;
    window.__finish();
  });
  await page.waitForFunction(() => document.documentElement.lang === "fr");
  await panel(/^Langue/)
    .getByRole("combobox", { name: "Langue", exact: true })
    .waitFor();
  assert.equal(
    await panel(/^Langue/)
      .locator("summary")
      .innerText(),
    "Langue",
  );
  assert.equal(
    await page
      .getByRole("combobox", { name: "Langue", exact: true })
      .inputValue(),
    "fr",
  );
  await panel(/^Sécurité/)
    .locator("summary")
    .waitFor();
  await page.evaluate(() => {
    window.__fail = true;
  });
  await page
    .getByRole("combobox", { name: "Langue", exact: true })
    .selectOption("it");
  await panel(/^Langue/)
    .getByRole("alert")
    .waitFor();
  assert.equal(await page.locator("html").getAttribute("lang"), "fr");
  await page.evaluate(() => {
    window.__fail = false;
  });
  await page
    .getByRole("combobox", { name: "Langue", exact: true })
    .selectOption("it");
  await page.waitForFunction(() => document.documentElement.lang === "it");
  assert.deepEqual(await page.evaluate(() => window.__calls), [
    "fr",
    "it",
    "it",
  ]);
  for (const locale of ["it", "fr"]) {
    for (const [width, height] of [
      [320, 740],
      [390, 844],
      [844, 390],
    ]) {
      await page.setViewportSize({ width, height });
      await page.goto(`${origin}/?locale=${locale}`);
      await page.locator("main details").last().waitFor();
      await noOverflow();
      await page.screenshot({
        path: path.join(screenshots, `${locale}-${width}-collapsed.png`),
        fullPage: true,
      });
      await page
        .locator("main details summary")
        .evaluateAll((elements) =>
          elements.forEach((element) => element.click()),
        );
      await noOverflow();
      const headings = await page
        .locator(
          'main [data-slot="card-title"], main summary > span > span:first-child',
        )
        .evaluateAll((elements) =>
          elements.map((element) => {
            const style = getComputedStyle(element);
            return [
              style.fontFamily,
              style.fontSize,
              style.fontWeight,
              style.lineHeight,
            ];
          }),
        );
      assert.equal(headings.length, 6);
      assert.ok(
        headings.every(
          (style) => JSON.stringify(style) === JSON.stringify(headings[0]),
        ),
        `Profile section headings share typography: ${JSON.stringify(headings)}`,
      );
      const surfaces = await page
        .locator('main > div > [data-slot="card"]')
        .evaluateAll((elements) =>
          elements.map((element) => {
            const style = getComputedStyle(element);
            return [
              style.backgroundColor,
              style.borderRadius,
              style.borderColor,
              style.boxShadow,
            ];
          }),
        );
      assert.ok(
        surfaces.every(
          (style) => JSON.stringify(style) === JSON.stringify(surfaces[0]),
        ),
        "Profile panels share surfaces",
      );
      const clippedButtons = await page
        .locator('main [data-slot="button"]')
        .evaluateAll((elements) =>
          elements
            .filter(
              (element) =>
                element.getClientRects().length &&
                (element.scrollWidth > element.clientWidth + 1 ||
                  element.scrollHeight > element.clientHeight + 1),
            )
            .map((element) => element.textContent.trim()),
        );
      assert.deepEqual(
        clippedButtons,
        [],
        "Profile action labels remain fully visible",
      );
      await page.screenshot({
        path: path.join(screenshots, `${locale}-${width}-expanded.png`),
        fullPage: true,
      });
      if (width === 320) {
        const languagePanel = panel(locale === "fr" ? /^Langue$/ : /^Lingua$/);
        await languagePanel.evaluate((element) =>
          element.scrollIntoView({ block: "center" }),
        );
        await languagePanel.screenshot({
          path: path.join(screenshots, `${locale}-language-320.png`),
        });
      }
    }
  }
  for (const locale of ["it", "fr"]) {
    const tr = catalogs[locale].ui;
    for (const [width, height] of [
      [320, 740],
      [390, 844],
      [844, 390],
    ]) {
      await page.setViewportSize({ width, height });
      await page.goto(`${origin}/news?locale=${locale}`);
      const navigation = page.getByRole("navigation", {
        name: tr.news,
        exact: true,
      });
      await navigation.waitFor();
      assert.equal(
        await navigation
          .locator("a > span")
          .evaluateAll((elements) =>
            elements.every(
              (element) =>
                element.scrollWidth <= element.clientWidth + 1 &&
                element.getBoundingClientRect().height < 30,
            ),
          ),
        true,
        "Bulletin labels fit on one line on narrow phones",
      );
      assert.equal(
        await navigation
          .getByRole("link", { name: tr.announcements })
          .getAttribute("aria-current"),
        "page",
      );
      assert.equal(
        await page.locator('#upcoming-events + [data-slot="card"] li').count(),
        3,
      );
      assert.equal(await page.locator("article").count(), 1);
      await page.waitForFunction(() => window.__seen === 1);
      await noOverflow();
      await page.screenshot({
        path: path.join(screenshots, `${locale}-bulletin-${width}.png`),
        fullPage: true,
      });
      const event = page.getByRole("button", { name: /Stage di collaudo 0/ });
      await event.click();
      await page
        .getByRole("dialog")
        .getByText("Dettagli dello stage")
        .waitFor();
      await noOverflow();
      await page.getByRole("button", { name: tr.close, exact: true }).click();
      assert.equal(
        await event.evaluate((element) => element === document.activeElement),
        true,
      );
      await navigation
        .getByRole("link", { name: tr.calendar, exact: true })
        .click();
      const calendarNav = page.getByRole("navigation", {
        name: tr.news,
        exact: true,
      });
      await calendarNav.waitFor();
      assert.equal(
        await calendarNav
          .getByRole("link", { name: tr.calendar, exact: true })
          .getAttribute("aria-current"),
        "page",
      );
      assert.equal(
        await page
          .locator('header.material-bar a[href="/news"]')
          .getAttribute("aria-current"),
        "page",
      );
      assert.equal(
        await page.locator('.app-nav a[aria-current="page"]').count(),
        0,
      );
      assert.equal(await page.evaluate(() => window.__seen ?? 0), 0);
      await noOverflow();
      await page.screenshot({
        path: path.join(
          screenshots,
          `${locale}-bulletin-calendar-${width}.png`,
        ),
        fullPage: true,
      });
      await calendarNav.getByRole("link", { name: tr.announcements }).click();
      await page.locator("article").waitFor();
    }
    await page.goto(`${origin}/news?locale=${locale}&scenario=empty`);
    await page.getByText(tr.noUpcomingEvents, { exact: true }).waitFor();
    await page.getByText(tr.noNews, { exact: true }).waitFor();
    assert.equal(await page.evaluate(() => window.__seen ?? 0), 0);
    await page.goto(`${origin}/news?locale=${locale}&scenario=unavailable`);
    await page
      .getByRole("status")
      .getByText(tr.eventsUnavailable, { exact: true })
      .waitFor();
    assert.equal(
      await page.getByText(tr.noUpcomingEvents, { exact: true }).count(),
      0,
    );
    await page.locator("article").waitFor();
  }
  assert.deepEqual(errors, []);
  console.log(
    "PASS: actual profile page with mocked data/actions; language panel has a single visible label and current selection, pending/error/retry, Italian/French headings, shared typography/surfaces, no overflow at 320/390px and landscape. Bulletin navigation, event preview/details, empty/unavailable states and unread isolation passed. No database writes.",
  );
} finally {
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
  assert.ok(
    path.resolve(temporary).startsWith(path.resolve(results) + path.sep),
  );
  await fs.rm(temporary, { recursive: true, force: true });
}
