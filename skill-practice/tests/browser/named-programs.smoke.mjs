import assert from "node:assert/strict";
import fs from "node:fs/promises";
import http from "node:http";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const requireTools = createRequire(path.join(path.dirname(app), "tools/video/package.json"));
process.env.PLAYWRIGHT_BROWSERS_PATH = "0";
const { build } = requireTools("esbuild");
const { chromium } = requireTools("playwright");
const results = path.join(app, "test-results");
await fs.mkdir(results, { recursive: true });
const temporary = await fs.mkdtemp(path.join(results, "named-programs-fixture-"));
let browser;
let server;
const catalogs = Object.fromEntries(await Promise.all(["it", "fr"].map(async locale => [locale, JSON.parse(await fs.readFile(path.join(app, `src/lib/i18n/${locale}.json`), "utf8"))])));
const ids = { a: "11111111-1111-4111-8111-111111111111", b: "22222222-2222-4222-8222-222222222222", c: "33333333-3333-4333-8333-333333333333" };

try {
  await fs.writeFile(path.join(temporary, "actions.ts"), `
export async function createCustomProgramFromForm(previous, data) {
 const name=String(data.get('name')).trim(); window.__calls.push({kind:'create',name});
 window.__programs.push({id:'${ids.c}',user_id:'owner',name,created_at:'2026-11-11',updated_at:'2026-11-11'});
 window.__items['${ids.c}']=[]; await window.__navigate('/plan/custom?program=${ids.c}'); return {success:true};
}
export async function renameCustomProgramFromForm(previous,data) {
 const id=data.get('program_id'), name=data.get('name');window.__calls.push({kind:'rename',id,name});
 window.__programs.find(p=>p.id===id).name=name;await window.__navigate('/programma?program='+id);return {success:true};
}
export async function deleteCustomProgramFromForm(previous,data) {
 const id=data.get('program_id');window.__calls.push({kind:'delete',id});
 if(window.__deleteError)return {error:'Fixture deletion failed'};
 window.__programs=window.__programs.filter(p=>p.id!==id);await window.__navigate('/programma');return {success:true};
}
export async function activateCustomProgramFromForm(data) {const id=data.get('program_id');window.__calls.push({kind:'activate',id});window.__profile.plan_mode='custom';window.__profile.active_custom_program_id=id;await window.__navigate('/programma?program='+id);}
export async function activateExamFormAction(){window.__profile.plan_mode='exam';await window.__navigate('/programma?program=exam');}
export async function hidePlanItem(){throw Error('Unexpected active-plan hide action');}
export async function updatePlanItemStatus(){throw Error('Unexpected active-plan status action');}
export async function updateCustomProgramItemStatus(programId,skillId,status) {window.__calls.push({kind:'status',programId,skillId,status});window.__items[programId].find(i=>i.skill_id===skillId).status=status;await window.__render();return {success:true};}
export async function saveCustomSelectionFromForm(previous,data) {
 const id=data.get('program_id'),discipline=data.get('discipline'), selected=data.getAll('skillIds');window.__calls.push({kind:'save',id,discipline,selected});
 const kept=window.__items[id].filter(i=>i.skill.discipline!==discipline);
 window.__items[id]=[...kept,...window.__skills.filter(s=>s.discipline===discipline&&selected.includes(s.id)).map(s=>window.__item(s))];
 await window.__navigate('/programma?program='+id);return {success:true};
}
export async function deleteCustomSelection(programId){window.__calls.push({kind:'clear',programId});window.__items[programId]=[];return {success:true};}
`);
  await fs.writeFile(path.join(temporary, "queries.ts"), `
import {createTranslator} from 'next-intl';
export const getCurrentProfile=async()=>window.__profile;
export const listCustomPrograms=async()=>window.__programs;
export const getUserPlanItems=async(user,discipline,source,programId)=>source==='exam_program'?[]:(window.__items[programId]||[]).filter(i=>!discipline||i.skill.discipline===discipline);
export const getSelectedSkillIds=async(user,source,programId)=>new Set((window.__items[programId]||[]).map(i=>i.skill_id));
export const getExamProgramById=async()=>null;
export const listSkillsAtGrade=async()=>[];
export const listSkillsForExam=async()=>[];
export const listVisibleSkillOptionsForDiscipline=async(discipline)=>window.__skills.filter(s=>s.discipline===discipline);
export const getTranslations=async()=>createTranslator({locale:window.__locale,messages:window.__catalogs,namespace:'ui',onError:error=>{throw error;}});
`);
  await fs.writeFile(path.join(temporary, "navigation.ts"), `export const useRouter=()=>({push:path=>window.__navigate(path)});export const redirect=path=>{throw Error('Unexpected redirect: '+path)};export const notFound=()=>{throw Error('Unexpected 404')};`);
  await fs.writeFile(path.join(temporary, "link.tsx"), `import React from 'react';export default function Link({href,children,prefetch,replace,scroll,...props}){return <a href={href} {...props} onClick={event=>{event.preventDefault();window.__navigate(href);}}>{children}</a>;}`);
  await fs.writeFile(path.join(temporary, "fixture.tsx"), `
import React from 'react';
import {createRoot} from 'react-dom/client';
import {NextIntlClientProvider} from 'next-intl';
import ProgrammaPage from '@/app/(app)/programma/page';
import PlanCustomPage from '@/app/(app)/plan/custom/page';
window.__locale=new URLSearchParams(location.search).get('locale')||'it';window.__catalogs=${JSON.stringify(catalogs)}[window.__locale];
window.__calls=[];window.__path='/programma';window.__params={program:'${ids.a}'};
window.__profile={id:'owner',school_id:'school',plan_mode:'exam',assigned_level_shaolin:1,assigned_level_taichi:1,preparing_exam_id:null,preparing_exam_taichi_id:null,active_custom_program_id:'${ids.a}'};
window.__programs=[{id:'${ids.a}',user_id:'owner',name:'Ripasso generale',created_at:'2026-11-11',updated_at:'2026-11-11'},{id:'${ids.b}',user_id:'owner',name:'Lavoro sulle armi',created_at:'2026-11-11',updated_at:'2026-11-11'}];
window.__skills=['Forma Shaolin','Forma T’ai Chi','Bastone'].map((name,index)=>({id:'skill-'+index,school_id:'school',name,name_italian:null,category:index===2?'armi_forma':'forme',discipline:index===1?'taichi':'shaolin',practice_mode:'solo',minimum_grade_value:1,is_extra:false,display_order:index,video_url:'',secondary_video_url:null,estimated_duration_seconds:180,created_at:'2026-11-11'}));
window.__item=skill=>({id:'item-'+skill.id,user_id:'owner',skill_id:skill.id,status:'maintenance',source:'manual',is_hidden:false,last_practiced_at:null,added_at:'2026-11-11',skill});
window.__items={'${ids.a}':window.__skills.slice(0,2).map(window.__item),'${ids.b}':[window.__skills[0],window.__skills[2]].map(window.__item)};
const root=createRoot(document.getElementById('root'));
window.__render=async()=>{const element=await(window.__path==='/plan/custom'?PlanCustomPage:ProgrammaPage)({searchParams:Promise.resolve(window.__params)});root.render(<NextIntlClientProvider locale={window.__locale} timeZone="Europe/Rome" messages={window.__catalogs}><main className="app-main">{element}</main></NextIntlClientProvider>);};
window.__navigate=async href=>{const url=new URL(href,location.origin);window.__path=url.pathname;window.__params=Object.fromEntries(url.searchParams);await window.__render();};
window.__render();
`);
  const aliases = { "@": path.join(app, "src"), react: path.join(app, "node_modules/react"), "react-dom": path.join(app, "node_modules/react-dom"), "next-intl": path.join(app, "node_modules/next-intl"), "next/navigation": path.join(temporary, "navigation.ts"), "next/link": path.join(temporary, "link.tsx"), "next-intl/server": path.join(temporary, "queries.ts"), "@/lib/actions/custom-programs": path.join(temporary, "actions.ts"), "@/lib/actions/plan": path.join(temporary, "actions.ts") };
  for (const name of ["custom-programs", "plan", "user-profile", "skills", "exam-programs"]) aliases[`@/lib/queries/${name}`] = path.join(temporary, "queries.ts");
  await build({ entryPoints: [path.join(temporary, "fixture.tsx")], outfile: path.join(temporary, "bundle.js"), bundle: true, jsx: "automatic", platform: "browser", define: { "process.env.NODE_ENV": '"production"' }, alias: aliases, logLevel: "silent" });
  const staticRoot = path.join(app, ".next/static");
  const cssFiles = (await fs.readdir(staticRoot, { recursive: true })).filter(file => file.endsWith(".css"));
  assert.ok(cssFiles.length, "Run build first, without concurrent builds.");
  const css = (await Promise.all(cssFiles.map(file => fs.readFile(path.join(staticRoot, file), "utf8")))).join("\n");
  const fontClasses = [...css.matchAll(/\.([^{}\s]+)\{--font-[^}]+\}/g)].map(match => match[1]).join(" ");
  const bundle = await fs.readFile(path.join(temporary, "bundle.js"));
  server = http.createServer(async (req, res) => {
    const pathname = new URL(req.url, "http://localhost").pathname;
    if (pathname === "/bundle.js") { res.setHeader("Content-Type", "text/javascript"); return res.end(bundle); }
    if (pathname === "/style.css") { res.setHeader("Content-Type", "text/css"); return res.end(css); }
    if (pathname.startsWith("/_next/static/")) {
      const file = path.resolve(staticRoot, pathname.slice("/_next/static/".length));
      if (file.startsWith(staticRoot + path.sep)) { try { return res.end(await fs.readFile(file)); } catch { /* Missing font. */ } }
      res.statusCode = 404; return res.end();
    }
    res.setHeader("Content-Type", "text/html;charset=utf-8");
    res.end(`<!doctype html><html class="${fontClasses}"><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/style.css"></head><body><div id="root"></div><script src="/bundle.js"></script></body></html>`);
  });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = []; page.on("pageerror", error => errors.push(error.message));
  await page.route("**/*", route => route.request().url().startsWith(origin) ? route.continue() : route.abort());
  const button = name => page.getByRole("button", { name, exact: true });
  for (const locale of ["it", "fr"]) {
    const tr = catalogs[locale].ui;
    await page.goto(`${origin}/?locale=${locale}`);
    await page.getByRole("combobox", { name: tr.viewedProgram }).waitFor();
    await page.evaluate(() => document.fonts.ready);
    const selector = page.getByRole("combobox", { name: tr.viewedProgram });
    assert.equal(await selector.locator("optgroup").count(), 2);
    await selector.selectOption(ids.b);
    await page.getByRole("heading", { name: "Lavoro sulle armi", exact: true }).waitFor();
    assert.equal(await page.evaluate(() => window.__profile.plan_mode), "exam");
    await button(tr.useForTraining).click();
    await page.waitForFunction(id => window.__profile.active_custom_program_id === id && window.__profile.plan_mode === 'custom', ids.b);
    await selector.selectOption(ids.a);
    await page.getByRole("heading", { name: "Ripasso generale", exact: true }).waitFor();
    assert.equal(await page.evaluate(() => window.__profile.active_custom_program_id), ids.b);
    await button(tr.planStatusFor.replace("{p0}", "Forma Shaolin")).click();
    await page.getByRole("dialog").getByRole("button", { name: tr.focus, exact: true }).click();
    await page.getByRole("dialog").waitFor({ state: "hidden" });
    assert.deepEqual(await page.evaluate(() => window.__calls.find(c => c.kind === 'status')), { kind: "status", programId: ids.a, skillId: "skill-0", status: "focus" });
    assert.equal(await page.evaluate(id => window.__items[id][0].status, ids.b), "maintenance");
    await page.locator('a[href*="d=taichi"]').click();
    assert.equal(await page.locator('a[href="/skill/skill-0"]').count(), 0);
    assert.equal(await page.locator('a[href="/skill/skill-1"]').count(), 1);
    assert.equal(await selector.inputValue(), ids.a);

    await button(tr.newCustomProgram).click();
    await page.getByRole("dialog").getByLabel(tr.customProgramName).fill("Programma del sabato");
    await page.getByRole("dialog").getByRole("button", { name: tr.createCustomProgram, exact: true }).click();
    await page.getByRole("heading", { name: "Programma del sabato", exact: true }).waitFor();
    assert.equal(await page.locator('input[name="program_id"]').inputValue(), ids.c);
    assert.equal(await page.evaluate(() => window.__profile.active_custom_program_id), ids.b);
    await page.locator('input[type="checkbox"][value="skill-0"]').check();
    await button(tr.savePlan).click();
    await page.getByRole("combobox", { name: tr.viewedProgram }).waitFor();
    assert.equal(await selector.inputValue(), ids.c);
    assert.equal(await page.evaluate(() => window.__profile.active_custom_program_id), ids.b);
    await button(tr.manageNamedProgram).click();
    await page.getByRole("dialog").getByLabel(tr.customProgramName).fill("Ripasso del sabato");
    await page.getByRole("dialog").getByRole("button", { name: tr.renameCustomProgram, exact: true }).click();
    await page.getByRole("heading", { name: "Ripasso del sabato", exact: true }).waitFor();
    await button(tr.manageNamedProgram).click();
    await page.getByRole("dialog").getByRole("button", { name: tr.deleteNamedProgram, exact: true }).click();
    await page.getByRole("alertdialog").getByRole("button", { name: tr.cancel, exact: true }).click();
    assert.equal(await page.evaluate(id => window.__programs.some(p => p.id === id), ids.c), true);
    await page.getByRole("dialog").getByRole("button", { name: tr.deleteNamedProgram, exact: true }).click();
    await page.getByRole("alertdialog").getByRole("button", { name: tr.delete, exact: true }).click();
    await page.waitForFunction(id => !window.__programs.some(p => p.id === id), ids.c);
    await page.getByRole("heading", { name: "Lavoro sulle armi", exact: true }).waitFor();
    await button(tr.manageNamedProgram).click();
    assert.equal(await page.getByRole("dialog").getByRole("button", { name: tr.deleteNamedProgram, exact: true }).isDisabled(), true);
    await page.keyboard.press("Escape");
    await page.getByRole("dialog").waitFor({ state: "hidden" });
    for (const width of [320, 390]) {
      await page.setViewportSize({ width, height: 844 });
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${locale}: overflow ${width}`);
      const screenshotDir = path.join(results, "named-programs"); await fs.mkdir(screenshotDir, { recursive: true });
      await page.screenshot({ path: path.join(screenshotDir, `${locale}-${width}.png`), fullPage: true });
    }
  }
  assert.deepEqual(errors, []);
  console.log("PASS: actual Programma/custom editor pages, grouped selector, preview vs activation, inactive-program status isolation, discipline filter, named creation, scoped save, rename, delete confirmation/cancellation and active deletion disabled; Italian/French, 320/390px. Mocked I/O; no account or production writes.");
} finally {
  await browser?.close();
  if (server) await new Promise(resolve => server.close(resolve));
  assert.ok(path.resolve(temporary).startsWith(path.resolve(results) + path.sep));
  await fs.rm(temporary, { recursive: true, force: true });
}
