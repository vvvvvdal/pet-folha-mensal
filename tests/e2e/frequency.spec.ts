import { test, expect, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";

const user = {
  id: "test-resume",
  name: "Pessoa de teste",
  role: "Estudante",
  gatNumber: "04",
  gatName: "Mangaba",
  createdAt: "2026-10-01T00:00:00.000Z",
};
const activity = {
  id: "test-record",
  date: "2026-10-07",
  start: "14:00",
  end: "15:30",
  description: "Registro anterior de teste",
  modality: "Síncrona virtual",
  hours: 2,
};
const keys = {
  profiles: "pet_folha_profiles_v2",
  active: "pet_folha_active_profile_id_v2",
  october: `pet_folha_activities_v2_${user.id}_2026-10`,
};

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date("2026-11-02T15:00:00Z") });
});

async function create(page: Page) {
  await page.goto("/");
  await expect(page.locator(".entry-page")).toBeVisible();
  const skip = page.getByRole("button", { name: "Pular", exact: true });
  if (await skip.isVisible()) await skip.click();
  await page
    .getByLabel("Nome completo", { exact: true })
    .fill("Participante sintético");
  await page
    .getByRole("button", { name: "Abrir minha folha", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Frequência", exact: true }),
  ).toBeVisible();
}

async function saveCopy(page: Page) {
  const mobile = page.locator(".mobile-copy");
  if (await mobile.isVisible()) {
    await mobile.click();
    await page.getByRole("region", { name: "Cópia de segurança" })
      .getByRole("button", { name: /Salvar cópia/ }).click();
  } else {
    await page.locator(".top-save").click();
  }
}

async function chooseCopy(page: Page, file: string) {
  const mobile = page.locator(".mobile-copy");
  if (await mobile.isVisible()) await mobile.click();
  const chooser = page.waitForEvent("filechooser");
  if (await mobile.isVisible()) {
    await page.getByRole("region", { name: "Cópia de segurança" })
      .getByRole("button", { name: /Restaurar cópia/ }).click();
  } else {
    await page.locator(".top-restore").click();
  }
  await (await chooser).setFiles(file);
}

async function openExit(page: Page) {
  const avatar = page.getByRole("button", { name: "Abrir Conta" });
  if (await avatar.isVisible()) {
    await avatar.click();
    await page.getByRole("button", { name: "Sair", exact: true }).click();
  } else {
    await page.locator(".profile-trigger").click();
    await page.getByRole("menuitem", { name: "Sair", exact: true }).click();
  }
  await expect(page.getByRole("dialog", { name: "Antes de sair" })).toBeVisible();
}

async function openProfile(page: Page) {
  const avatar = page.getByRole("button", { name: "Abrir Conta" });
  if (await avatar.isVisible()) {
    await avatar.click();
    await page.getByRole("button", { name: "Meu perfil", exact: true }).click();
  } else {
    await page.locator(".profile-trigger").click();
    await page.getByRole("menuitem", { name: "Meu perfil", exact: true }).click();
  }
}

async function openActivityForm(page: Page) {
  if ((page.viewportSize()?.width ?? 1440) < 900) {
    if (!(await page.getByRole("dialog", { name: "Adicionar atividade", exact: true }).isVisible()))
      await page.locator("#add-activity-trigger").click();
  }
  await expect(page.getByLabel("Atividade realizada", { exact: true })).toBeVisible();
}

async function closeActivityForm(page: Page) {
  const close = page.getByRole("button", { name: "Fechar atividade", exact: true });
  if (await close.isVisible()) await close.click();
}

async function add(page: Page, description = "Atividade sintética") {
  await openActivityForm(page);
  await page.getByLabel("Data", { exact: true }).fill("2026-11-02");
  await page.getByLabel("Entrada", { exact: true }).fill("13:30");
  await page.getByLabel("Saída", { exact: true }).fill("17:30");
  await page
    .getByLabel("Atividade realizada", { exact: true })
    .fill(description);
  await page
    .getByRole("button", { name: "Adicionar atividade", exact: true })
    .click();
  await expect(page.locator(".summary-total strong")).toHaveText("5");
}

test("cópia fica acessível no cabeçalho e menu móvel devolve o foco", async ({ page }) => {
  await create(page);
  const mobile = page.locator(".mobile-copy");
  if (await mobile.isVisible()) {
    const panel = page.getByRole("region", { name: "Cópia de segurança" });
    await mobile.focus();
    await page.keyboard.press("Enter");
    await expect(mobile).toHaveAttribute("aria-expanded", "true");
    await expect(panel.getByText("Baixar seus registros e comprovantes.")).toBeVisible();
    await expect(panel.getByText("Abrir uma cópia salva em arquivo.")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(panel).not.toBeVisible();
    await expect(mobile).toBeFocused();
    await expect(mobile).toHaveAttribute("aria-expanded", "false");
  } else {
    await expect(page.locator(".top-restore")).toBeVisible();
    await expect(page.locator(".top-save")).toBeVisible();
    const restore = await page.locator(".top-restore").boundingBox();
    const save = await page.locator(".top-save").boundingBox();
    expect(restore!.x + restore!.width).toBeLessThanOrEqual(save!.x);
  }
});

test("perfil repetido retoma sem arquivo e preserva meses anteriores", async ({
  page,
}) => {
  await page.addInitScript(
    ({ user, activity, keys }) => {
      if (localStorage.getItem("test-seeded")) return;
      localStorage.setItem(keys.profiles, JSON.stringify([user]));
      localStorage.setItem(keys.october, JSON.stringify([activity]));
      localStorage.setItem("test-seeded", "1");
    },
    { user, activity, keys },
  );
  await page.goto("/");
  await expect(
    page.getByLabel("Perfil neste navegador", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Primeiro acesso", exact: true })
    .click();
  await page
    .getByLabel("Nome completo", { exact: true })
    .fill("  PESSOA DE TESTE  ");
  await page
    .getByRole("button", { name: "Abrir minha folha", exact: true })
    .click();
  await expect(
    page.getByText("Sua folha já está neste navegador", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Continuar com este perfil", exact: true })
    .click();
  await expect(page.getByLabel("Mês da folha")).toHaveValue("2026-11");
  await expect(page.locator(".summary-total strong")).toHaveText("0");
  await page.getByLabel("Mês da folha").selectOption("2026-10");
  await expect(page.locator(".summary-total strong")).toHaveText("2");
  await openExit(page);
  await page.getByRole("dialog", { name: "Antes de sair" })
    .getByRole("button", { name: "Sair", exact: true })
    .click();
  await page.getByRole("button", { name: "Continuar com este perfil", exact: true }).click();
  await page.reload();
  const stored = await page.evaluate(
    (keys) => ({
      profiles: JSON.parse(localStorage.getItem(keys.profiles)!),
      october: JSON.parse(localStorage.getItem(keys.october)!),
      active: localStorage.getItem(keys.active),
    }),
    keys,
  );
  expect(stored.profiles).toHaveLength(1);
  expect(stored.active).toBe(user.id);
  expect(stored.october).toEqual([activity]);
});

test("lançar, editar, exportar, restaurar, imprimir e excluir", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await create(page);
  await add(page);
  await page.getByRole("button", { name: /^Editar atividade:/ }).click();
  const edit = page
    .getByRole("dialog", { name: "Editar atividade", exact: true })
    .first();
  await edit.getByLabel("Saída", { exact: true }).fill("18:30");
  await edit.getByRole("button", { name: /Salvar/ }).click();
  await expect(page.locator(".summary-total strong")).toHaveText("6");
  await page.reload();
  await expect(page.locator(".summary-total strong")).toHaveText("6");
  await page.evaluate(() =>
    Object.defineProperty(window, "showSaveFilePicker", {
      configurable: true,
      value: undefined,
    }),
  );
  const downloadPromise = page.waitForEvent("download");
  await saveCopy(page);
  const download = await downloadPromise;
  const backupPath = testInfo.outputPath("backup.json");
  await download.saveAs(backupPath);
  await chooseCopy(page, backupPath);
  await expect(
    page.getByText("Restaurar esta cópia?", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Restaurar cópia", exact: true })
    .click();
  await expect(
    page.getByText("Cópia restaurada. Confira o mês e os registros.", {
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Folha", exact: true })
    .click();
  await expect(page.locator(".sheet-stage .official-sheet")).toContainText(
    "TOTAL: 6 horas",
  );
  await page.evaluate(() => {
    window.print = () => {
      document.documentElement.dataset.printOpened = "true";
    };
  });
  await page
    .getByRole("button", { name: "Imprimir / salvar PDF", exact: true })
    .click();
  await expect(page.locator("html")).toHaveAttribute(
    "data-print-opened",
    "true",
  );
  if (testInfo.project.name === "desktop") {
    await page.emulateMedia({ media: "print" });
    await page.pdf({
      path: testInfo.outputPath("folha.pdf"),
      preferCSSPageSize: true,
      printBackground: true,
    });
    await page.emulateMedia({ media: "screen" });
  }
  await page
    .getByRole("button", { name: "Frequência", exact: true })
    .click();
  await page.getByRole("button", { name: /^Excluir atividade:/ }).click();
  await page.getByRole("button", { name: "Sim, excluir", exact: true }).click();
  await expect(page.locator(".summary-total strong")).toHaveText("0");
  expect(errors).toEqual([]);
});

test("erro de cópia e cancelamento preservam dados; formulário não some ao trocar de mês", async ({
  page,
}) => {
  await create(page);
  await add(page);
  await page
    .getByLabel("Restaurar cópia de segurança", { exact: true })
    .setInputFiles({
      name: "invalido.json",
      mimeType: "application/json",
      buffer: Buffer.from(
        '{"user":{"name":"SEGREDO_TESTE"},"activities":[null]}',
      ),
    });
  await expect(
    page.getByText("Não foi possível restaurar", { exact: true }),
  ).toBeVisible();
  await page.getByText("Detalhes para suporte", { exact: true }).click();
  await expect(page.locator(".operation-notice pre")).not.toContainText(
    "SEGREDO_TESTE",
  );
  await expect(page.locator(".summary-total strong")).toHaveText("5");
  await page.getByRole("button", { name: "Fechar aviso", exact: true }).click();
  await openActivityForm(page);
  await page
    .getByLabel("Atividade realizada", { exact: true })
    .fill("Rascunho mantido");
  await closeActivityForm(page);
  await page.getByLabel("Mês da folha").selectOption("2026-10");
  await page
    .getByRole("button", { name: "Continuar editando", exact: true })
    .click();
  await expect(
    page.getByLabel("Atividade realizada", { exact: true }),
  ).toHaveValue("Rascunho mantido");
  await expect(page.getByLabel("Mês da folha")).toHaveValue("2026-11");
});

test("temas, larguras, controles e retorno de foco", async ({
  page,
}, testInfo) => {
  await create(page);
  await add(page);
  for (const theme of ["dark", "light"]) {
    await page.evaluate((theme) => {
      localStorage.setItem("pet_theme", theme);
      window.dispatchEvent(new Event("pet-theme-change"));
      document.documentElement.dataset.theme = theme;
    }, theme);
    for (const width of [360, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await openActivityForm(page);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
      const sizes = await page
        .locator(
          "#nova-atividade input:visible, #nova-atividade select:visible, #nova-atividade textarea:visible",
        )
        .evaluateAll((elements) =>
          elements.map((element) => ({
            width: element.getBoundingClientRect().width,
            height: element.getBoundingClientRect().height,
            font: parseFloat(getComputedStyle(element).fontSize),
          })),
        );
      expect(
        sizes.every(
          (size) => size.width >= 44 && size.height >= 44 && size.font >= 16,
        ),
      ).toBe(true);
      await closeActivityForm(page);
      const smallText = await page
        .locator(
          ".screen-only label, .screen-only button, .screen-only p, .screen-only td, .screen-only th, .screen-only small",
        )
        .evaluateAll((elements) =>
          elements
            .filter(
              (element) =>
                element.getBoundingClientRect().width &&
                element.getBoundingClientRect().height &&
                !element.closest(".official-sheet"),
            )
            .filter(
              (element) => parseFloat(getComputedStyle(element).fontSize) < 14,
            )
            .map(
              (element) =>
                element.tagName +
                ": " +
                element.textContent?.trim().slice(0, 50),
            ),
        );
      expect(smallText).toEqual([]);
      await page.screenshot({
        path: testInfo.outputPath(`painel-${theme}-${width}.png`),
        fullPage: true,
      });
    }
  }
  await page.locator(".profile-trigger").click();
  const help = page.getByRole("menuitem", { name: "Ajuda e suporte", exact: true });
  await help.click();
  await expect(
    page.getByRole("dialog", { name: "Ajuda com sua folha", exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator(".profile-trigger")).toBeFocused();
});

test("falha de gravação mantém formulário e permite tentar novamente", async ({
  page,
}) => {
  await create(page);
  await openActivityForm(page);
  await page.getByLabel("Entrada", { exact: true }).fill("13:30");
  await page.getByLabel("Saída", { exact: true }).fill("17:30");
  await page
    .getByLabel("Atividade realizada", { exact: true })
    .fill("Preenchimento preservado");
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    Object.defineProperty(window, "restoreStorageForTest", {
      value: () => {
        Storage.prototype.setItem = original;
      },
    });
    Storage.prototype.setItem = function (key, value) {
      if (key.startsWith("pet_folha_activities_v2_"))
        throw new DOMException("Quota", "QuotaExceededError");
      original.call(this, key, value);
    };
  });
  await page
    .getByRole("button", { name: "Adicionar atividade", exact: true })
    .click();
  await expect(page.locator(".operation-notice[role=alert]")).toContainText(
    "Seu preenchimento foi mantido",
  );
  await expect(
    page.getByLabel("Atividade realizada", { exact: true }),
  ).toHaveValue("Preenchimento preservado");
  await expect(page.locator(".summary-total strong")).toHaveText("0");
  await page.evaluate(() => {
    const restore = Reflect.get(window, "restoreStorageForTest");
    if (typeof restore !== "function")
      throw new Error("Missing test recovery callback");
    restore();
  });
  await page
    .getByRole("button", { name: "Adicionar atividade", exact: true })
    .click();
  await expect(page.locator(".summary-total strong")).toHaveText("5");
});

test("folha extensa pagina e mantém assinaturas somente no final", async ({
  page,
}) => {
  await create(page);
  await page.evaluate(() => {
    const id = localStorage.getItem("pet_folha_active_profile_id_v2");
    const records = Array.from({ length: 40 }, (_, index) => ({
      id: `long-${index}`,
      date: "2026-11-02",
      start: "14:00",
      end: "15:00",
      modality: "Síncrona virtual",
      description:
        "Descrição sintética extensa para verificar o limite de impressão. ".repeat(
          4,
        ),
      hours: 1,
    }));
    localStorage.setItem(
      `pet_folha_activities_v2_${id}_2026-11`,
      JSON.stringify(records),
    );
  });
  await page.reload();
  await page
    .getByRole("button", { name: "Folha", exact: true })
    .click();
  await page.evaluate(() => {
    window.print = () => {
      document.documentElement.dataset.printOpened = "true";
    };
  });
  await page
    .getByRole("button", { name: "Imprimir / salvar PDF", exact: true })
    .click();
  await expect(page.locator("html")).toHaveAttribute("data-print-opened", "true");
  const bytes = await page.pdf({ preferCSSPageSize: true });
  const { getDocument } = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const task = getDocument({ data: new Uint8Array(bytes) });
  const pdf = await task.promise;
  try {
    expect(pdf.numPages).toBeGreaterThan(1);
    for (let number = 1; number <= pdf.numPages; number++) {
      const sheet = await pdf.getPage(number);
      const content = await sheet.getTextContent();
      const text = content.items.map((item) => "str" in item ? item.str : "").join(" ");
      if (number === pdf.numPages) {
        expect(text).toContain("Assinatura do Participante");
        expect(text).toContain("Assinatura da Supervisão do GAT");
        expect(text).toContain("TOTAL: 40 horas");
      } else {
        expect(text).not.toContain("Assinatura do Participante");
        expect(text).not.toContain("Assinatura da Supervisão do GAT");
      }
    }
  } finally {
    await task.destroy();
  }
  expect(
    await page.evaluate(() => {
      const id = localStorage.getItem("pet_folha_active_profile_id_v2");
      return JSON.parse(
        localStorage.getItem(`pet_folha_activities_v2_${id}_2026-11`)!,
      ).length;
    }),
  ).toBe(40);
});

test("erro em edição mantém o diálogo, o preenchimento e o foco", async ({
  page,
}) => {
  await create(page);
  await add(page);
  await page.getByRole("button", { name: /^Editar atividade:/ }).click();
  const edit = page.getByRole("dialog", {
    name: "Editar atividade",
    exact: true,
  });
  await edit
    .getByLabel("Descrição da Atividade", { exact: true })
    .fill("Correção preservada");
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException("Quota", "QuotaExceededError");
    };
  });
  await edit.getByRole("button", { name: /Salvar/ }).click();
  await expect(
    page.getByText("Atividade não salva", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Entendido", exact: true }).click();
  await expect(
    edit.getByLabel("Descrição da Atividade", { exact: true }),
  ).toHaveValue("Correção preservada");
  await expect(edit.getByRole("button", { name: /Salvar/ })).toBeFocused();
  await edit.getByRole("button", { name: "Cancelar", exact: true }).click();
  await openProfile(page);
  const profile = page.getByRole("dialog", {
    name: "Identificação do participante",
    exact: true,
  });
  await profile.getByLabel("Nome completo", { exact: true }).fill("Identificação preservada");
  await profile.getByRole("button", { name: /Salvar/ }).click();
  await expect(
    page.getByText("Identificação não salva", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Entendido", exact: true }).click();
  await expect(profile.getByLabel("Nome completo", { exact: true })).toHaveValue(
    "Identificação preservada",
  );
});


test("seletor de mês mantém opções contrastantes nos dois temas e funciona pelo teclado", async ({ page }, testInfo) => {
  await create(page);
  const month = page.getByLabel("Mês da folha", { exact: true });
  for (const theme of ["dark", "light"]) {
    await page.evaluate((theme) => {
      document.documentElement.dataset.theme = theme;
    }, theme);
    const colors = await month.locator("option").first().evaluate((option) => {
      const style = getComputedStyle(option);
      const rgb = (color: string) => color.match(/[\d.]+/g)!.slice(0, 3).map(Number);
      const luminance = (color: string) => rgb(color).map(v => v / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4).reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0);
      const a = luminance(style.color), b = luminance(style.backgroundColor);
      return { background: style.backgroundColor, scheme: style.colorScheme, contrast: (Math.max(a, b) + .05) / (Math.min(a, b) + .05) };
    });
    expect(colors.background).not.toBe("rgba(0, 0, 0, 0)");
    expect(colors.scheme).toBe(theme);
    expect(colors.contrast).toBeGreaterThanOrEqual(4.5);
    await month.selectOption("2026-11");
    await expect(month).toHaveValue("2026-11");
    await month.focus();
    await page.keyboard.press("ArrowDown");
    await expect(month).toHaveValue("2026-12");
    if (testInfo.project.name === "desktop") {
      await month.press("Alt+ArrowDown");
      await page.screenshot({ path: testInfo.outputPath(`month-${theme}.png`) });
      await page.keyboard.press("Escape");
    }
  }
});


test("entrada oculta só o exemplo antigo sem uso e explica os arquivos sem expansão", async ({ page }) => {
  const legacy = { id: "mariana-rios", name: "Mariana Dias Rios", role: "Estudante", gatNumber: "01", gatName: "Araticum", createdAt: "2026-09-01T00:00:00.000Z" };
  await page.goto("/");
  await page.evaluate((legacy) => {
    localStorage.setItem("pet_folha_profiles_v2", JSON.stringify([legacy]));
  }, legacy);
  await page.reload();
  const skip = page.getByRole("button", { name: "Pular", exact: true });
  if (await skip.isVisible()) await skip.click();
  await expect(page.getByLabel("Nome completo", { exact: true })).toBeVisible();
  await expect(page.getByRole("group", { name: "Como deseja começar" }).getByRole("button", { name: "Continuar", exact: true })).toHaveCount(0);
  await expect(page.getByText(/Guarda sua identificação, atividades, comprovantes e relatórios/)).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("pet_folha_profiles_v2")!).length)).toBe(1);
  await page.evaluate(() => localStorage.setItem("pet_folha_activities_v2_mariana-rios_2026-10", "[]"));
  await page.reload();
  await expect(page.getByLabel("Perfil neste navegador", { exact: true })).toHaveValue(legacy.id);
  await expect(page.getByText(/Quem usa este navegador pode abrir/)).toBeVisible();
  await page.getByRole("button", { name: "Continuar com este perfil", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Frequência", exact: true })).toBeVisible();
});

const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAMklEQVR4nGP4T2PAQCcLFPoCqI5GLRi1YNSCUQtGLRi1YNSCUQtGLRi1gBwLaAdobgEAXUfXXDidab8AAAAASUVORK5CYII=",
  "base64",
);
const imageProof = { name: "foto.png", mimeType: "image/png", buffer: png };

function makePdf(pageCount: number) {
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Count " + pageCount + " /Kids [" +
      Array.from({ length: pageCount }, (_, i) => 3 + 2 * i + " 0 R").join(" ") + "] >>",
  ];
  for (let i = 0; i < pageCount; i++) {
    const instructions = i % 2 ? "0 0 1 rg 0 0 400 200 re f" : "1 0 0 rg 0 0 400 200 re f";
    const orientation = i % 2 ? " /Rotate 90" : "";
    objects.push("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 400 200]" +
      orientation + " /Resources << >> /Contents " + (4 + 2 * i) + " 0 R >>");
    objects.push("<< /Length " + instructions.length + " >>\nstream\n" + instructions + "\nendstream");
  }
  let source = "%PDF-1.4\n";
  const offsets = objects.map((object, i) => {
    const offset = source.length;
    source += (i + 1) + " 0 obj\n" + object + "\nendobj\n";
    return String(offset).padStart(10, "0") + " 00000 n \n";
  });
  const xref = source.length;
  source += "xref\n0 " + (objects.length + 1) + "\n0000000000 65535 f \n" + offsets.join("") +
    "trailer\n<< /Size " + (objects.length + 1) + " /Root 1 0 R >>\nstartxref\n" + xref + "\n%%EOF\n";
  return Buffer.from(source);
}

function proofs(page: Page) {
  return page.getByRole("region", { name: "Arquivos deste mês" });
}

async function openSheet(page: Page) {
  await page.getByRole("button", { name: "Comprovantes", exact: true }).click();
  await expect(proofs(page).getByLabel("Adicionar comprovantes")).toBeEnabled();
}

async function restoreCopy(page: Page, data: object, inputLabel = "Restaurar cópia de segurança") {
  await page.getByLabel(inputLabel, { exact: true }).setInputFiles({
    name: "copia.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(data)),
  });
  const dialog = page.getByRole("dialog", { name: "Restaurar esta cópia?" });
  await dialog.getByRole("button", { name: "Restaurar cópia", exact: true }).click();
  await expect(page.getByText("Lendo e conferindo a cópia…", { exact: true })).toHaveCount(0);
}

test("comprovantes opcionais persistem por mês e perfil e entram nas duas impressões", async ({ page }, testInfo) => {
  await create(page);
  await openSheet(page);
  await expect(proofs(page)).toContainText("Nenhum comprovante neste mês");
  await proofs(page).getByLabel("Adicionar comprovantes").setInputFiles([
    imageProof,
    { name: "relatorio.pdf", mimeType: "application/pdf", buffer: makePdf(2) },
    { name: "invalido.png", mimeType: "image/png", buffer: Buffer.from("texto") },
    { name: "grande.pdf", mimeType: "application/pdf", buffer: makePdf(31) },
    { name: "corrompido.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.4\nbroken") },
  ]);
  const review = page.getByRole("dialog", { name: "Conferir comprovantes" });
  const notices = review.getByRole("alert");
  await expect(notices).toContainText("invalido.png: formato inválido");
  await expect(notices).toContainText("grande.pdf: o PDF excede o limite de 30 páginas");
  await expect(notices).toContainText("corrompido.pdf: o PDF está ilegível");
  await expect(review.getByRole("button", { name: /^Visualizar .* em outra aba$/ })).toHaveCount(2);
  await review.getByRole("button", { name: "Salvar comprovantes" }).click();
  await expect(review).toHaveCount(0);

  await page.reload();
  await openSheet(page);
  await expect(proofs(page).getByRole("button", { name: "Visualizar foto.png em outra aba" })).toBeVisible();
  await page.evaluate(() => {
    window.print = () => {
      const pages = [...document.querySelectorAll<HTMLImageElement>(".print-attachment-page img")];
      document.documentElement.dataset.printPages = pages.map(({ naturalWidth, naturalHeight }) =>
        naturalWidth === naturalHeight ? "quadrada" : naturalWidth > naturalHeight ? "paisagem" : "retrato"
      ).join(",") || "sem-comprovantes";
    };
  });
  await page.getByRole("button", { name: "Folha", exact: true }).click();
  const print = () => page.getByRole("button", { name: "Imprimir / salvar PDF", exact: true }).click();
  await print();
  await expect(page.locator("html")).toHaveAttribute("data-print-pages", "quadrada,paisagem,retrato");
  if (testInfo.project.name === "desktop") {
    const pdf = await page.pdf({ path: testInfo.outputPath("folha-com-comprovantes.pdf"), preferCSSPageSize: true });
    expect(pdf.toString("latin1").match(/\/Type \/Page\b/g)).toHaveLength(4);
  }

  await page.getByRole("button", { name: "Modelo em branco", exact: true }).click();
  await expect(proofs(page)).toHaveCount(0);
  await print();
  await expect(page.locator("html")).toHaveAttribute("data-print-pages", "sem-comprovantes");
  await openExit(page);
  await page.getByRole("dialog", { name: "Antes de sair" })
    .getByRole("button", { name: "Imprimir / salvar PDF", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-print-pages", "quadrada,paisagem,retrato");
  await page.getByRole("button", { name: "Continuar editando", exact: true }).click();

  await openSheet(page);
  await page.getByLabel("Mês da folha").selectOption("2026-10");
  await expect(proofs(page)).toContainText("Nenhum comprovante neste mês");
  await page.getByLabel("Mês da folha").selectOption("2026-11");
  const removePhoto = proofs(page).getByRole("button", { name: "Remover arquivo foto.png" });
  await removePhoto.click();
  const confirmation = page.getByRole("dialog", { name: "Remover comprovante?" });
  await confirmation.getByRole("button", { name: "Cancelar", exact: true }).click();
  await expect(removePhoto).toBeFocused();
  await removePhoto.click();
  await confirmation.getByRole("button", { name: "Remover arquivo", exact: true }).click();
  await expect(proofs(page).getByRole("button", { name: "Visualizar foto.png em outra aba" })).toHaveCount(0);
  await expect(proofs(page).getByRole("button", { name: "Visualizar relatorio.pdf em outra aba" })).toBeVisible();

  await openExit(page);
  await page.getByRole("dialog", { name: "Antes de sair" }).getByRole("button", { name: "Sair", exact: true }).click();
  await page.getByRole("button", { name: "Sair sem salvar cópia", exact: true }).click();
  await page.getByRole("button", { name: "Primeiro acesso", exact: true }).click();
  await page.getByLabel("Nome completo", { exact: true }).fill("Outro participante");
  await page.getByRole("button", { name: "Abrir minha folha", exact: true }).click();
  await openSheet(page);
  await expect(proofs(page)).toContainText("Nenhum comprovante neste mês");
});

test("cópias com comprovantes levam os originais e a restauração reverte falhas", async ({ page, browser }, testInfo) => {
  test.setTimeout(90_000);
  await create(page);
  await add(page);
  await openSheet(page);
  const input = proofs(page).getByLabel("Adicionar comprovantes");
  await input.setInputFiles(imageProof);
  const review = page.getByRole("dialog", { name: "Conferir comprovantes" });
  await review.getByRole("checkbox", { name: /Atividade sintética/ }).check();
  await review.getByRole("button", { name: "Salvar comprovantes" }).click();
  await expect(proofs(page).getByRole("button", { name: "Visualizar foto.png em outra aba" })).toBeVisible();
  await page.evaluate(() => Object.defineProperty(window, "showSaveFilePicker", {
    configurable: true, value: undefined,
  }));
  const downloadPromise = page.waitForEvent("download");
  await saveCopy(page);
  const file = testInfo.outputPath("copia-com-comprovantes.json");
  await (await downloadPromise).saveAs(file);
  const data = JSON.parse(await readFile(file, "utf8"));
  expect(data.version).toBe("1.3");
  expect(data.attachments[0].activityIds).toEqual([data.activities[0].id]);
  expect(data.attachments.map(({ name, base64 }: { name: string; base64: string }) =>
    [name, Buffer.from(base64, "base64")])).toEqual([["foto.png", png]]);

  const secondBrowser = await browser.newContext({ locale: "pt-BR" });
  try {
    const fresh = await secondBrowser.newPage();
    await fresh.goto(page.url());
    await fresh.getByRole("button", { name: "Já tenho uma cópia", exact: true }).click();
    await restoreCopy(fresh, data, "Cópia de segurança da folha");
    await expect(fresh.locator(".summary-total strong")).toHaveText("5");
    await openSheet(fresh);
    await expect(proofs(fresh).getByRole("button", { name: "Visualizar foto.png em outra aba" })).toBeVisible();
    await expect(proofs(fresh).getByRole("list", { name: "Atividades vinculadas" })).toContainText("Atividade sintética");
  } finally {
    await secondBrowser.close();
  }

  const legacy = { ...data, version: "1.0", attachments: undefined };
  await restoreCopy(page, legacy);
  await expect(proofs(page).getByRole("button", { name: "Visualizar foto.png em outra aba" })).toBeVisible();
  await expect(proofs(page).getByRole("list", { name: "Atividades vinculadas" })).toContainText("Atividade sintética");

  const invalid = { ...data, attachments: [{ ...data.attachments[0], activityIds: ["id-ausente"] }] };
  await page.getByLabel("Restaurar cópia de segurança", { exact: true }).setInputFiles({
    name: "copia.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(invalid)),
  });
  await expect(page.getByText("A cópia contém vínculos de comprovantes inválidos.")).toBeVisible();
  await expect(proofs(page).getByRole("list", { name: "Atividades vinculadas" })).toContainText("Atividade sintética");

  await page.evaluate(() => {
    const put = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function (...args) {
      const request = put.apply(this, args);
      request.addEventListener("success", () => this.transaction.abort(), { once: true });
      return request;
    };
  });
  await input.setInputFiles({ ...imageProof, name: "nao-salvo.png" });
  await review.getByRole("button", { name: "Salvar comprovantes" }).click();
  await expect(review.getByRole("alert")).not.toBeEmpty();
  await review.getByRole("button", { name: "Cancelar", exact: true }).click();
  await page.getByRole("dialog", { name: "Descartar arquivos selecionados?" }).getByRole("button", { name: "Descartar seleção" }).click();
  await expect(proofs(page).getByRole("button", { name: "Visualizar foto.png em outra aba" })).toBeVisible();
  await expect(proofs(page).getByRole("button", { name: "Visualizar nao-salvo.png em outra aba" })).toHaveCount(0);

  const replacement = {
    ...data, activities: [], attachments: [{ ...data.attachments[0], name: "substituta.png", activityIds: [] }],
  };
  await restoreCopy(page, replacement);
  await expect(page.getByText("Não foi possível restaurar", { exact: true })).toBeVisible();
  await expect(proofs(page).getByRole("button", { name: "Visualizar foto.png em outra aba" })).toBeVisible();
  await page.getByRole("button", { name: "Frequência", exact: true }).click();
  await expect(page.locator(".summary-total strong")).toHaveText("5");

  await page.reload();
  await openSheet(page);
  await expect(proofs(page).getByRole("button", { name: "Visualizar foto.png em outra aba" })).toBeVisible();
  await restoreCopy(page, { ...legacy, activities: [] });
  await restoreCopy(page, legacy);
  await expect(proofs(page).getByRole("list", { name: "Atividades vinculadas" })).toHaveCount(0);
  for (const version of ["1.1", "1.2"]) {
    await restoreCopy(page, { ...data, version });
    await expect(proofs(page).getByRole("button", { name: "Visualizar foto.png em outra aba" })).toBeVisible();
    await expect(proofs(page).getByRole("list", { name: "Atividades vinculadas" })).toHaveCount(0);
  }
  await restoreCopy(page, replacement);
  await expect(proofs(page).getByRole("button", { name: "Visualizar substituta.png em outra aba" })).toBeVisible();
  await expect(proofs(page).getByRole("button", { name: "Visualizar foto.png em outra aba" })).toHaveCount(0);
});

test("comprovantes agrupados repetem as páginas e mantêm vínculos ao editar", async ({ page }, testInfo) => {
  test.setTimeout(60_000);
  const first = { ...activity, date: "2026-11-02", description: "Oficina de teste" };
  const second = {
    ...first, id: "test-record-2", date: "2026-11-09",
    description: "Atualização do site " + "com descrição longa para verificar a paginação ".repeat(22) + "FIM DA DESCRIÇÃO",
  };
  await page.addInitScript(({ user, records }) => {
    if (localStorage.getItem("test-seeded")) return;
    localStorage.setItem("pet_folha_profiles_v2", JSON.stringify([user]));
    localStorage.setItem("pet_folha_active_profile_id_v2", user.id);
    localStorage.setItem(`pet_folha_activities_v2_${user.id}_2026-11`, JSON.stringify(records));
    localStorage.setItem("test-seeded", "1");
  }, { user, records: [second, first] });
  await page.goto("/");
  await openSheet(page);
  const region = proofs(page);
  const input = region.getByLabel("Adicionar comprovantes");
  await input.setInputFiles(imageProof);
  const review = page.getByRole("dialog", { name: "Conferir comprovantes" });
  await review.getByRole("button", { name: "Salvar comprovantes" }).click();
  await input.setInputFiles({
    name: "arquivo-" + "longo".repeat(40) + ".pdf",
    mimeType: "application/pdf", buffer: makePdf(2),
  });
  await review.getByRole("checkbox", { name: /Atualização do site/ }).check();
  await review.getByRole("button", { name: "Salvar comprovantes" }).click();
  const shared = region.getByRole("button", { name: "Alterar atividades de foto.png" });
  const dialog = page.getByRole("dialog", { name: "Alterar atividades do comprovante" });
  const firstCheck = dialog.getByRole("checkbox", { name: /Oficina de teste/ });
  const secondCheck = dialog.getByRole("checkbox", { name: /Atualização do site/ });
  const saveLinks = dialog.getByRole("button", { name: "Salvar atividades", exact: true });

  await expect(shared).toBeEnabled();
  await shared.focus();
  await expect(shared).toBeFocused();
  await page.keyboard.press("Enter");
  await firstCheck.check();
  await page.keyboard.press("Escape");
  await expect(shared).toBeFocused();
  await shared.click();
  await expect(firstCheck).not.toBeChecked();
  await firstCheck.check();
  await secondCheck.check();
  await saveLinks.click();
  await expect(region).toContainText("4 de 30 páginas");

  await page.reload();
  await openSheet(page);
  await expect(region.getByRole("button", { name: "Visualizar foto.png em outra aba" })).toHaveCount(1);
  await expect(region).toContainText("4 de 30 páginas");
  await input.setInputFiles({ ...imageProof, name: "avulso.png" });
  await review.getByRole("button", { name: "Salvar comprovantes" }).click();
  await expect(region).toContainText("5 de 30 páginas");

  await page.evaluate(() => { window.print = () => { document.body.dataset.printed = "true"; }; });
  await page.getByRole("button", { name: "Folha", exact: true }).click();
  await page.getByRole("button", { name: "Imprimir / salvar PDF", exact: true }).click();
  await expect(page.locator("body")).toHaveAttribute("data-printed", "true");
  const pages = page.locator(".print-attachment-page");
  await expect(pages.locator("h2")).toHaveText([
    "Comprovantes · Atividade 1",
    "Comprovantes · Atividade 2",
    "Comprovantes · Atividade 2",
    "Comprovantes · Atividade 2",
    "Comprovantes · Sem atividade vinculada",
  ]);
  await expect(pages.nth(0)).toContainText("02/11/2026 · Chegada 14:00 · Saída 15:30");
  await expect(pages.nth(2)).toContainText("Página 1 de 2");
  await expect(pages.nth(3)).toContainText("Página 2 de 2");
  const imageUrls = await pages.locator("img").evaluateAll((images) =>
    images.map((image) => (image as HTMLImageElement).src));
  expect(imageUrls[0]).toBe(imageUrls[1]);
  if (testInfo.project.name === "desktop") {
    const pdf = await page.pdf({ path: testInfo.outputPath("folha-com-vinculos.pdf"), preferCSSPageSize: true });
    // Two official pages, including the one with signatures, followed by five proof pages.
    expect(pdf.toString("latin1").match(/\/Type \/Page\b/g)).toHaveLength(7);
    await openSheet(page);
    for (const width of [360, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const theme of ["light", "dark"]) {
        await page.locator("html").evaluate((element, value) => { element.dataset.theme = value; }, theme);
        await region.scrollIntoViewIfNeeded();
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
        await region.screenshot({ path: testInfo.outputPath(`comprovantes-${width}-${theme}.png`) });
        await shared.click();
        await expect(firstCheck).toBeChecked();
        await expect(secondCheck).toBeChecked();
        await dialog.screenshot({ path: testInfo.outputPath(`vinculos-${width}-${theme}.png`) });
        await page.keyboard.press("Escape");
        await expect(shared).toBeFocused();
      }
    }
  }

  await openSheet(page);
  await input.setInputFiles({ name: "limite.pdf", mimeType: "application/pdf", buffer: makePdf(16) });
  await review.getByRole("button", { name: "Salvar comprovantes" }).click();
  await expect(region).toContainText("21 de 30 páginas");
  await region.getByRole("button", { name: "Alterar atividades de limite.pdf" }).click();
  await firstCheck.check();
  await secondCheck.check();
  await saveLinks.click();
  await expect(dialog.getByRole("alert")).toContainText("ultrapassa o limite de 30 páginas");
  await expect(firstCheck).toBeChecked();
  await expect(secondCheck).toBeChecked();
  await dialog.getByRole("button", { name: "Cancelar", exact: true }).click();
  await expect(region).toContainText("21 de 30 páginas");

  await page.getByRole("button", { name: "Frequência", exact: true }).click();
  await page.getByRole("button", { name: "Editar atividade: Oficina de teste" }).click();
  await page.getByLabel("Descrição da Atividade", { exact: true }).fill("Oficina atualizada");
  await page.getByRole("button", { name: "Salvar Alterações", exact: true }).click();
  await openSheet(page);
  await expect(region).toContainText("Oficina atualizada");
  await page.getByRole("button", { name: "Frequência", exact: true }).click();
  await page.getByRole("button", { name: "Excluir atividade: Oficina atualizada" }).click();
  await page.getByRole("button", { name: "Sim, excluir" }).click();
  await openSheet(page);
  await expect(region).toContainText("20 de 30 páginas");
  await expect(region.getByRole("list", { name: "Atividades vinculadas" }).first()).toContainText("Atualização do site");
  await expect(region.getByRole("button", { name: "Visualizar foto.png em outra aba" })).toBeVisible();

  await page.getByRole("button", { name: "Frequência", exact: true }).click();
  await page.getByRole("button", { name: /^Excluir atividade: Atualização do site/ }).click();
  await page.getByRole("button", { name: "Sim, excluir" }).click();
  await openSheet(page);
  await expect(region.getByRole("list", { name: "Atividades vinculadas" })).toHaveCount(0);
  await expect(region.getByRole("listitem").filter({
    has: page.getByRole("button", { name: "Alterar atividades de foto.png" }),
  })).toContainText("Sem atividade. Aparece no final dos comprovantes.");
  await expect(region).toContainText("20 de 30 páginas");
});

test("preparar Forms, confirmar envio, revisar edição e restaurar relatório", async ({ page }, testInfo) => {
  await create(page);
  await add(page);
  await page.getByRole("button", { name: /^Enviar ao Forms:/ }).click();
  const panel = page.getByRole("dialog", { name: "Enviar ao Forms", exact: true });
  await expect(panel.getByLabel("E-mail para o formulário")).toHaveValue("");
  await panel.getByLabel("E-mail para o formulário").fill("teste@example.com");
  await panel.getByLabel("Tipo de atividade no Forms").selectOption("Reunião Interna do seu GAT");
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    Reflect.set(window, "restoreReportStorage", () => { Storage.prototype.setItem = original; });
    Storage.prototype.setItem = function (key, value) {
      if (key.startsWith("pet_folha_activities")) throw new DOMException("Quota", "QuotaExceededError");
      original.call(this, key, value);
    };
  });
  await panel.getByRole("button", { name: "Abrir Forms preenchido", exact: true }).click();
  await expect(panel.getByRole("alert")).toContainText("Não foi possível salvar");
  await expect(panel.getByLabel("Tipo de atividade no Forms")).toHaveValue("Reunião Interna do seu GAT");
  await expect(panel.getByLabel("E-mail para o formulário")).toHaveValue("teste@example.com");
  await page.evaluate(() => {
    const restore = Reflect.get(window, "restoreReportStorage");
    if (typeof restore === "function") restore();
    window.open = () => null;
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: async (value: string) => { document.documentElement.dataset.copiedSummary = value; } },
    });
  });
  await panel.getByRole("button", { name: "Abrir Forms preenchido", exact: true }).click();
  await expect(panel.getByRole("alert")).toContainText("bloqueou a nova aba");
  const href = await panel.getByRole("link", { name: "Abrir o link preparado", exact: true }).getAttribute("href");
  const params = new URL(href!).searchParams;
  expect(params.get("entry.333612427")).toBe("2026-11-02");
  expect(params.get("emailAddress")).toBe("teste@example.com");
  expect(params.get("entry.1054891050")).toMatch(/^Síncrono Virtual/);
  expect(params.get("entry.62230450")).toBe("5");
  expect(params.get("entry.1807232520_hour")).toBe("13");
  expect(params.get("entry.1807232520_minute")).toBe("30");
  expect(params.get("entry.748998103_hour")).toBe("17");
  expect(params.get("entry.1781993657")).toBe("não");
  expect(params.get("entry.1074022684")).toBe("não");
  expect(params.get("emailReceipt")).toBeNull();
  await expect(panel.getByRole("radiogroup", { name: "Receber cópia por e-mail?" })).toHaveCount(0);
  await panel.getByRole("button", { name: "Copiar resumo", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-copied-summary", /Atividade sintética[\s\S]*13:30 às 17:30/);
  await page.evaluate(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: async () => { throw new Error("Clipboard unavailable"); } },
    });
  });
  await panel.getByRole("button", { name: "Copiar resumo", exact: true }).click();
  await expect(panel.getByRole("alert")).toContainText("O resumo foi selecionado");
  await panel.getByRole("radio", { name: "Sim" }).first().check({ force: true });
  await panel.getByLabel("Quantas pessoas (só número)").fill("7");
  await panel.getByLabel("Tipo de atendimento ou procedimento").fill("Aferição de pressão");
  await panel.getByRole("button", { name: "Abrir Forms preenchido", exact: true }).click();
  const served = new URL((await panel.getByRole("link", { name: "Abrir o link preparado", exact: true }).getAttribute("href"))!).searchParams;
  expect(served.get("emailReceipt")).toBeNull();
  expect(served.get("entry.1781993657")).toBe("sim");
  expect(served.get("entry.2115801122")).toBe("7");
  expect(served.get("entry.1412130923")).toBe("Aferição de pressão");
  await panel.getByLabel("Já enviei").check();
  await expect(panel.getByRole("status")).toHaveText("Marcado como enviado.");
  await panel.getByRole("button", { name: "Fechar", exact: true }).click();
  await page.getByLabel("Mostrar só pendências do Forms").check();
  await expect(page.getByText("Nenhuma pendência do Forms neste mês.", { exact: true })).toBeVisible();
  await page.getByLabel("Mostrar só pendências do Forms").uncheck();
  await page.reload();
  await expect(page.locator(".report-state:visible")).toHaveText("Enviado");
  await page.getByRole("button", { name: /^Editar atividade:/ }).click();
  const edit = page.getByRole("dialog", { name: "Editar atividade", exact: true });
  await edit.getByLabel("Descrição da Atividade", { exact: true }).fill("Descrição alterada após envio");
  await edit.getByRole("button", { name: /Salvar/ }).click();
  await expect(page.locator(".report-state:visible")).toHaveText("Revisar envio");

  await page.evaluate(() => Object.defineProperty(window, "showSaveFilePicker", { configurable: true, value: undefined }));
  const pendingDownload = page.waitForEvent("download");
  await saveCopy(page);
  const backupPath = testInfo.outputPath("relatorio-1.2.json");
  await (await pendingDownload).saveAs(backupPath);
  const backup = JSON.parse(await readFile(backupPath, "utf8"));
  expect(backup.version).toBe("1.3");
  expect(backup.activities[0].formReport.confirmation.at).toBeTruthy();
  await restoreCopy(page, { ...backup, version: "1.1" });
  await expect(page.locator(".report-state:visible")).toHaveText("Pendente");
  await restoreCopy(page, backup);
  await expect(page.locator(".report-state:visible")).toHaveText("Revisar envio");
  await page.getByRole("button", { name: /^Enviar ao Forms:/ }).click();
  await panel.getByLabel("Revisar envio").uncheck();
  await expect(panel.getByRole("status")).toHaveText("Marcado como pendente.");
  await panel.getByRole("button", { name: "Fechar", exact: true }).click();
  await page.getByLabel("Mês da folha").selectOption("2026-10");
  await expect(page.getByRole("button", { name: /^Enviar ao Forms:/ })).toHaveCount(0);
});

test("novidades na entrada mostram publicação e histórico nos dois temas", async ({ page }, testInfo) => {
  await page.goto("/");
  const bell = page.locator('.entry-header button[aria-controls="entry-news"]');
  const panel = page.getByRole("region", { name: "Novidades", exact: true });
  await bell.click();
  await expect(panel.getByRole("heading", { name: "Lançamentos e janelas reorganizados" })).toBeVisible();
  await expect(panel.getByText("10 de novembro de 2026").first()).toBeVisible();
  for (const theme of ["light", "dark"]) {
    await page.evaluate((theme) => { document.documentElement.dataset.theme = theme; }, theme);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await panel.screenshot({ path: testInfo.outputPath("novidades-" + theme + ".png") });
  }
  await page.keyboard.press("Escape");
  await expect(bell).toBeFocused();
  await bell.click();
  await panel.getByText("Ver atualizações anteriores", { exact: true }).click();
  await expect(panel.getByText("Sua folha continua neste navegador", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Fechar novidades" }).click();
  await expect(panel).not.toBeVisible();
});

test("Forms de eventos sugere a atividade e preserva ajustes manuais", async ({ page }) => {
  await create(page);
  await add(page, "Congresso - Mesa 13: PET-Saúde");
  const launch = page.getByRole("button", { name: /^Enviar ao Forms:/ });
  await launch.click();
  const panel = page.getByRole("dialog", { name: "Enviar ao Forms", exact: true });
  await panel.getByLabel("E-mail para o formulário").fill("teste@example.com");
  await panel.getByLabel("Tipo de atividade no Forms").selectOption("Participação em eventos");
  await panel.getByLabel("Nome do evento").fill("Congresso");
  const detail = panel.getByLabel("Qual foi a atividade?");
  await expect(detail).toHaveValue("Mesa 13: PET-Saúde");
  await detail.fill("Mesa 13 e debate");
  await page.evaluate(() => { window.open = () => null; });
  await panel.getByRole("button", { name: "Abrir Forms preenchido", exact: true }).click();
  const href = await panel.getByRole("link", { name: "Abrir o link preparado", exact: true }).getAttribute("href");
  const params = new URL(href!).searchParams;
  expect(params.get("entry.2090033171")).toBe("Congresso");
  expect(params.get("entry.2101167383")).toBe("Mesa 13 e debate");
  await page.reload();
  await launch.click();
  await expect(detail).toHaveValue("Mesa 13 e debate");
});

test("sino de novidades preserva rascunho e guarda leitura", async ({ page }, testInfo) => {
  await create(page);
  const bell = page.getByRole("button", { name: "Novidades", exact: true });
  const panel = page.getByRole("region", { name: "Novidades", exact: true });
  await openActivityForm(page);
  await page.getByLabel("Atividade realizada", { exact: true }).fill("Rascunho preservado");
  await closeActivityForm(page);
  await expect(bell.locator(".news-dot")).toBeVisible();
  await bell.press("Enter");
  await expect(panel.getByRole("heading", { name: "Lançamentos e janelas reorganizados" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(bell).toBeFocused();
  await expect(page.getByLabel("Atividade realizada", { exact: true })).toHaveValue("Rascunho preservado");
  await page.reload();
  await expect(bell.locator(".news-dot")).toHaveCount(0);
  await openSheet(page);
  if (testInfo.project.name === "mobile") await page.setViewportSize({ width: 360, height: 800 });
  for (const theme of ["light", "dark"]) {
    await page.locator("html").evaluate((element, value) => { element.dataset.theme = value; }, theme);
    await bell.click();
    const heading = panel.getByRole("heading", { name: "Lançamentos e janelas reorganizados" });
    if (!(await heading.isVisible())) await panel.getByText("Ver atualizações anteriores", { exact: true }).click();
    await expect(heading).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(await page.evaluate(() => window.innerWidth));
    await panel.screenshot({ path: testInfo.outputPath(`sino-novidades-${theme}.png`) });
    await page.getByRole("button", { name: "Fechar novidades" }).click();
    await expect(panel).not.toBeVisible();
  }
  await bell.click();
  await page.locator("main").click({ position: { x: 5, y: 5 }, force: true });
  await expect(panel).not.toBeVisible();
});
