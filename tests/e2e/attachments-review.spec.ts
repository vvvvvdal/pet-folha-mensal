import { test, expect, type Page } from "@playwright/test";

const user = { id: "proof-review-user", name: "Pessoa de teste", role: "Estudante", gatNumber: "04", gatName: "Mangaba", createdAt: "2026-10-01T00:00:00.000Z" };
const records = [
  { id: "activity-a", date: "2026-11-02", start: "14:00", end: "15:30", description: "Atividade A", modality: "Síncrona virtual", hours: 2 },
  { id: "activity-b", date: "2026-11-09", start: "14:00", end: "15:30", description: "Atividade B", modality: "Síncrona virtual", hours: 2 },
];
const image = { name: "foto.png", mimeType: "image/png", buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAMklEQVR4nGP4T2PAQCcLFPoCqI5GLRi1YNSCUQtGLRi1YNSCUQtGLRi1gBwLaAdobgEAXUfXXDidab8AAAAASUVORK5CYII=", "base64") };
function twoPagePdf() {
  const colors = ["1 0 0 rg 0 0 400 200 re f", "0 0 1 rg 0 0 400 200 re f"];
  const objects = ["<< /Type /Catalog /Pages 2 0 R >>", "<< /Type /Pages /Count 2 /Kids [3 0 R 5 0 R] >>"];
  colors.forEach((color, i) => { objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 400 200] /Resources << >> /Contents ${4 + 2 * i} 0 R >>`, `<< /Length ${color.length} >>\nstream\n${color}\nendstream`); });
  let source = "%PDF-1.4\n";
  const offsets = objects.map((object, i) => { const offset = source.length; source += `${i + 1} 0 obj\n${object}\nendobj\n`; return `${String(offset).padStart(10, "0")} 00000 n \n`; });
  const xref = source.length;
  source += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.join("")}trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(source);
}
async function openProofs(page: Page) {
  await page.clock.install({ time: new Date("2026-11-12T15:00:00Z") });
  await page.addInitScript(({ user, records }) => {
    if (sessionStorage.getItem("proof-seeded")) return;
    localStorage.setItem("pet_folha_profiles_v2", JSON.stringify([user]));
    localStorage.setItem("pet_folha_active_profile_id_v2", user.id);
    localStorage.setItem(`pet_folha_activities_v2_${user.id}_2026-11`, JSON.stringify(records));
    sessionStorage.setItem("proof-seeded", "1");
  }, { user, records });
  await page.goto("/");
  await page.getByRole("button", { name: "Comprovantes", exact: true }).click();
  await expect(page.getByRole("region", { name: "Arquivos deste mês" }).getByLabel("Adicionar comprovantes")).toBeEnabled();
}
async function persisted(page: Page) {
  return page.evaluate(async (id) => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => { const request = indexedDB.open("pet-folha-comprovantes", 1); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); });
    try { return await new Promise<{ name: string; activityIds?: string[] }[]>((resolve, reject) => { const request = db.transaction("months").objectStore("months").get([id, "2026-11"]); request.onsuccess = () => resolve(request.result ?? []); request.onerror = () => reject(request.error); }); }
    finally { db.close(); }
  }, user.id);
}

test("revisão mantém lote temporário, permite descartar e salva vínculos por arquivo", async ({ page }, testInfo) => {
  await openProofs(page);
  const region = page.getByRole("region", { name: "Arquivos deste mês" });
  const input = region.getByLabel("Adicionar comprovantes");
  const pdf = { name: "paginas.pdf", mimeType: "application/pdf", buffer: twoPagePdf() };
  await input.setInputFiles([image, pdf]);
  const review = page.getByRole("dialog", { name: "Conferir comprovantes" });
  await expect(review).toBeVisible();
  if (testInfo.project.name === "mobile") {
    const box = await review.locator(".editor-panel").boundingBox();
    expect(box).not.toBeNull();
    expect(Math.abs(page.viewportSize()!.height - (box!.y + box!.height))).toBeLessThanOrEqual(2);
  }
  expect(await persisted(page)).toEqual([]);
  const pdfCard = review.locator(".review-file").filter({ hasText: "paginas.pdf" });
  await pdfCard.scrollIntoViewIfNeeded();
  const preview = pdfCard.getByRole("img", { name: "Prévia de paginas.pdf" });
  await expect(preview).toBeVisible();
  const thumbnail = await preview.evaluate((node: HTMLImageElement) => {
    const canvas = document.createElement("canvas"); canvas.width = node.naturalWidth; canvas.height = node.naturalHeight;
    const context = canvas.getContext("2d")!; context.drawImage(node, 0, 0);
    return { width: node.naturalWidth, height: node.naturalHeight, color: [...context.getImageData(Math.floor(canvas.width / 2), Math.floor(canvas.height / 2), 1, 1).data] };
  });
  expect(Math.max(thumbnail.width, thumbnail.height)).toBeLessThanOrEqual(320);
  expect(thumbnail.width / thumbnail.height).toBeCloseTo(2, 1);
  expect(thumbnail.color[0]).toBeGreaterThan(200);
  expect(thumbnail.color[2]).toBeLessThan(50);
  await page.evaluate(() => { window.open = ((url) => { (window as Window & { proofOpened?: string }).proofOpened = String(url); return null; }) as typeof window.open; });
  await pdfCard.getByRole("button", { name: "Visualizar paginas.pdf em outra aba" }).click();
  const opened = await page.evaluate(async () => {
    const url = (window as Window & { proofOpened?: string }).proofOpened!;
    return { url, prefix: (await (await fetch(url)).text()).slice(0, 8) };
  });
  expect(opened.url).toMatch(/^blob:/);
  expect(opened.prefix).toBe("%PDF-1.4");
  await review.getByRole("button", { name: "Cancelar", exact: true }).click();
  const confirm = page.getByRole("dialog", { name: "Descartar arquivos selecionados?" });
  await confirm.getByRole("button", { name: "Continuar conferindo" }).click();
  await expect(review).toBeVisible();
  expect(await persisted(page)).toEqual([]);
  await review.getByRole("button", { name: "Cancelar", exact: true }).click();
  await confirm.getByRole("button", { name: "Descartar seleção" }).click();
  await expect(review).toHaveCount(0);
  expect(await persisted(page)).toEqual([]);

  await input.setInputFiles([image, pdf]);
  const photoCard = review.locator(".review-file").filter({ hasText: "foto.png" });
  await photoCard.getByRole("checkbox", { name: /Atividade A/ }).check();
  await photoCard.getByRole("checkbox", { name: /Atividade B/ }).check();
  await photoCard.getByRole("button", { name: "Limpar seleção" }).click();
  await expect(photoCard.getByRole("checkbox", { name: /Atividade A/ })).not.toBeChecked();
  await expect(photoCard.getByRole("checkbox", { name: /Atividade B/ })).not.toBeChecked();
  await expect(photoCard).toContainText("Sem atividade selecionada");
  await photoCard.getByRole("checkbox", { name: /Atividade A/ }).check();
  await photoCard.getByRole("checkbox", { name: /Atividade B/ }).check();
  await pdfCard.getByRole("checkbox", { name: /Atividade B/ }).check();
  await review.getByRole("button", { name: "Salvar comprovantes" }).click();
  await expect(review).toHaveCount(0);
  const saved = await persisted(page);
  expect(saved.map(({ name, activityIds }) => [name, activityIds])).toEqual([["foto.png", ["activity-a", "activity-b"]], ["paginas.pdf", ["activity-b"]]]);
  await page.reload();
  await page.getByRole("button", { name: "Comprovantes", exact: true }).click();
  await expect(region.getByRole("button", { name: "Visualizar foto.png em outra aba" })).toBeVisible();
  await expect(region.getByRole("list", { name: "Atividades vinculadas" }).first()).toContainText("Atividade A");
  await expect(region.getByRole("list", { name: "Atividades vinculadas" }).first()).toContainText("Atividade B");
  await region.getByRole("button", { name: "Alterar atividades de foto.png" }).click();
  const edit = page.getByRole("dialog", { name: "Alterar atividades do comprovante" });
  await expect(edit).toBeVisible();
  if (testInfo.project.name === "mobile") {
    const box = await edit.locator(".editor-panel").boundingBox();
    expect(box).not.toBeNull();
    expect(Math.abs(page.viewportSize()!.height - (box!.y + box!.height))).toBeLessThanOrEqual(2);
    await page.screenshot({ path: testInfo.outputPath("atividades-celular.png") });
  }
  await expect(edit.getByRole("checkbox", { name: /Atividade A/ })).toBeChecked();
  await expect(edit.getByRole("checkbox", { name: /Atividade B/ })).toBeChecked();
});

test("falha de gravação preserva revisão e permite salvar após recuperar", async ({ page }) => {
  await openProofs(page);
  const region = page.getByRole("region", { name: "Arquivos deste mês" });
  await region.getByLabel("Adicionar comprovantes").setInputFiles([image, { ...image, name: "outra.png" }]);
  const review = page.getByRole("dialog", { name: "Conferir comprovantes" });
  await review.locator(".review-file").filter({ hasText: "outra.png" }).getByRole("checkbox", { name: /Atividade B/ }).check();
  await page.evaluate(() => {
    const original = IDBObjectStore.prototype.put;
    (window as Window & { restoreProofPut?: () => void }).restoreProofPut = () => { IDBObjectStore.prototype.put = original; };
    IDBObjectStore.prototype.put = function (...args) { const request = original.apply(this, args); request.addEventListener("success", () => this.transaction.abort(), { once: true }); return request; };
  });
  await review.getByRole("button", { name: "Salvar comprovantes" }).click();
  await expect(review.getByRole("alert")).not.toBeEmpty();
  await expect(review.locator(".review-file")).toHaveCount(2);
  await expect(review.getByRole("checkbox", { name: /Atividade B/ }).last()).toBeChecked();
  expect(await persisted(page)).toEqual([]);
  await page.evaluate(() => (window as Window & { restoreProofPut?: () => void }).restoreProofPut?.());
  await review.getByRole("button", { name: "Salvar comprovantes" }).click();
  await expect(review).toHaveCount(0);
  expect((await persisted(page)).map(({ name }) => name)).toEqual(["foto.png", "outra.png"]);
});

test("galeria dedicada, WebP, popover nos atalhos secundários e larguras sem estouro", async ({ page }) => {
  await openProofs(page);
  const region = page.getByRole("region", { name: "Arquivos deste mês" });
  const galleryInput = region.getByLabel("Adicionar fotos da galeria");
  const filesInput = region.getByLabel("Adicionar comprovantes");
  await expect(galleryInput).toHaveAttribute("accept", "image/*");
  await expect(filesInput).toHaveAttribute(
    "accept",
    ".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp",
  );

  const webpBase64 = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 24;
    canvas.height = 16;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#007c46";
    ctx.fillRect(0, 0, 24, 16);
    return canvas.toDataURL("image/webp").split(",")[1];
  });

  const [galleryChooser] = await Promise.all([
    page.waitForEvent("filechooser"),
    region.getByRole("button", { name: "Fotos da galeria", exact: true }).click(),
  ]);
  expect(galleryChooser.isMultiple()).toBe(true);
  await galleryChooser.setFiles({
    name: "captura-galeria.webp",
    mimeType: "image/webp",
    buffer: Buffer.from(webpBase64, "base64"),
  });

  const review = page.getByRole("dialog", { name: "Conferir comprovantes" });
  await expect(review).toBeVisible();
  await expect(review.getByRole("img", { name: "Prévia de captura-galeria.webp" })).toBeVisible();

  const addMore = review.getByRole("button", { name: "Adicionar mais arquivos" });
  await addMore.focus();
  await page.keyboard.press("Enter");
  const reviewMenu = review.getByRole("menu", { name: "Origem do comprovante" });
  await expect(reviewMenu).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(reviewMenu).toBeHidden();
  await expect(review).toBeVisible();
  await expect(addMore).toBeFocused();

  await review.locator(".review-file").getByRole("checkbox", { name: /Atividade A/ }).check();
  await review.getByRole("button", { name: "Salvar comprovantes" }).click();
  await expect(review).toHaveCount(0);

  const missing = region.locator(".attachments-missing");
  await missing.locator("summary").click();
  const attachB = missing.getByRole("button", { name: /Anexar comprovante a .*Atividade B/ });
  await attachB.focus();
  await page.keyboard.press("Enter");
  const missingMenu = missing.getByRole("menu", { name: "Origem do comprovante" });
  await expect(missingMenu).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(missingMenu).toBeHidden();
  await expect(attachB).toBeFocused();

  await attachB.click();
  await expect(missingMenu).toBeVisible();
  const [missingGalleryChooser] = await Promise.all([
    page.waitForEvent("filechooser"),
    missingMenu.getByRole("menuitem", { name: /Fotos da galeria/ }).click(),
  ]);
  await missingGalleryChooser.setFiles([
    image,
    {
      name: "camera-iphone.heic",
      mimeType: "image/heic",
      buffer: Buffer.from("\x00\x00\x00\x18ftypheic\x00\x00\x00\x00heicmif1", "latin1"),
    },
  ]);
  await expect(review).toBeVisible();
  await expect(review.locator(".review-file").getByRole("checkbox", { name: /Atividade B/ })).toBeChecked();
  await expect(review.getByRole("alert")).toContainText("camera-iphone.heic:");
  await review.getByRole("button", { name: "Salvar comprovantes" }).click();
  await expect(review).toHaveCount(0);

  for (const width of [320, 360, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const theme of ["light", "dark"]) {
      await page.evaluate((value) => { document.documentElement.dataset.theme = value; }, theme);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    }
  }
});
