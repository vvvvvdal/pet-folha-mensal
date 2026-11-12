import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { chromium } from "playwright";

// Exercise the real IndexedDB transaction in a browser with isolated test records.
const require = createRequire(import.meta.url);
const ts = require("typescript");
const source = ts.transpileModule(readFileSync(new URL("../src/lib/attachments.ts", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const server = createServer((_request, response) => response.end("attachment test"));
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${server.address().port}`);
  const result = await page.evaluate(async (source) => {
    const testModule = { exports: {} };
    let available = ["activity-a", "activity-b"];
    const load = (id) => {
      if (id === "./storage") return { getActivitiesForMonth: () => available.map((id) => ({ id })) };
      throw new Error(`Unexpected import ${id}`);
    };
    new Function("require", "module", "exports", source)(load, testModule, testModule.exports);
    const { savePreparedAttachments, listAttachments } = testModule.exports;
    const scope = { profileId: "draft-test", monthKey: "2026-11" };
    const item = (id, pages, activityIds = []) => ({ id, name: `${id}.png`, file: new Blob(["file"], { type: "image/png" }), pages, activityIds });
    await savePreparedAttachments(scope, [item("existing", 2)]);
    async function failedAndUnchanged(candidates) {
      let error = "";
      try { await savePreparedAttachments(scope, candidates); } catch (caught) { error = String(caught); }
      return { error, ids: (await listAttachments(scope)).map(({ id }) => id) };
    }
    const duplicate = await failedAndUnchanged([item("new", 1), item("existing", 1)]);
    const sameBatch = await failedAndUnchanged([item("same", 1), item("same", 1)]);
    const tooManyPages = await failedAndUnchanged([item("linked", 15, ["activity-a", "activity-b"])]);
    available = ["activity-a"];
    const stale = await failedAndUnchanged([item("new", 1), item("stale", 1, ["activity-b"])]);
    const success = await savePreparedAttachments(scope, [item("new", 1, ["activity-a"]), item("second", 1)]);
    return { duplicate, sameBatch, tooManyPages, stale, success: success.map(({ id }) => id) };
  }, source);
  for (const failure of [result.duplicate, result.sameBatch, result.tooManyPages, result.stale]) {
    assert.ok(failure.error);
    assert.deepEqual(failure.ids, ["existing"]);
  }
  assert.match(result.tooManyPages.error, /30 páginas/);
  assert.match(result.stale.error, /atividades selecionadas/);
  assert.deepEqual(result.success, ["existing", "new", "second"]);
  console.log("Lote de comprovantes: atomicidade, vínculos e limites validados no IndexedDB.");
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
