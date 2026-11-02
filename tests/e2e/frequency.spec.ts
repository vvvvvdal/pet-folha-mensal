import { test, expect, type Page } from "@playwright/test";

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
  await page
    .getByLabel("Nome completo", { exact: true })
    .fill("Participante sintético");
  await page
    .getByRole("button", { name: "Abrir minha folha", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Minha frequência", exact: true }),
  ).toBeVisible();
}

async function add(page: Page) {
  await page.getByLabel("Data", { exact: true }).fill("2026-11-02");
  await page.getByLabel("Entrada", { exact: true }).fill("13:30");
  await page.getByLabel("Saída", { exact: true }).fill("17:30");
  await page
    .getByLabel("Atividade realizada", { exact: true })
    .fill("Atividade sintética");
  await page
    .getByRole("button", { name: "Adicionar atividade", exact: true })
    .click();
  await expect(page.locator(".summary-total strong")).toHaveText("5");
}

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
  await page.getByRole("button", { name: "Concluir", exact: true }).click();
  await page
    .getByRole("button", { name: "Sair / trocar participante", exact: true })
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
  await page.getByRole("button", { name: "Salvar cópia", exact: true }).click();
  const download = await downloadPromise;
  const backupPath = testInfo.outputPath("backup.json");
  await download.saveAs(backupPath);
  await page
    .getByLabel("Restaurar cópia de segurança", { exact: true })
    .setInputFiles(backupPath);
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
    .getByRole("button", { name: "Folha oficial", exact: true })
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
    .getByRole("button", { name: "Minha frequência", exact: true })
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
  await page
    .getByLabel("Atividade realizada", { exact: true })
    .fill("Rascunho mantido");
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
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
      const sizes = await page
        .locator(
          "#nova-atividade input, #nova-atividade select, #nova-atividade textarea",
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
  const help = page.getByRole("button", { name: "Abrir ajuda", exact: true });
  await help.click();
  await expect(
    page.getByRole("dialog", { name: "Ajuda com sua folha", exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(help).toBeFocused();
});

test("falha de gravação mantém formulário e permite tentar novamente", async ({
  page,
}) => {
  await create(page);
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

test("folha extensa é preservada e não imprime conteúdo cortado", async ({
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
    .getByRole("button", { name: "Folha oficial", exact: true })
    .click();
  await page.evaluate(() => {
    window.print = () => {
      document.documentElement.dataset.printOpened = "true";
    };
  });
  await page
    .getByRole("button", { name: "Imprimir / salvar PDF", exact: true })
    .click();
  await expect(
    page.getByText("O conteúdo ultrapassa uma página", { exact: true }),
  ).toBeVisible();
  await expect(page.locator("html")).not.toHaveAttribute(
    "data-print-opened",
    "true",
  );
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
  await page
    .getByRole("button", { name: /Participante sintético Estudante/ })
    .click();
  const profile = page.getByRole("dialog", {
    name: "Identificação do participante",
    exact: true,
  });
  await profile.getByRole("textbox").fill("Identificação preservada");
  await profile.getByRole("button", { name: /Salvar/ }).click();
  await expect(
    page.getByText("Identificação não salva", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Entendido", exact: true }).click();
  await expect(profile.getByRole("textbox")).toHaveValue(
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
    await month.focus();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
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
  await expect(page.getByLabel("Nome completo", { exact: true })).toBeVisible();
  await expect(page.getByRole("group", { name: "Como deseja começar" }).getByRole("button", { name: "Continuar", exact: true })).toHaveCount(0);
  await expect(page.getByText(/O JSON é um arquivo que guarda sua identificação/)).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("pet_folha_profiles_v2")!).length)).toBe(1);
  await page.evaluate(() => localStorage.setItem("pet_folha_activities_v2_mariana-rios_2026-10", "[]"));
  await page.reload();
  await expect(page.getByLabel("Perfil neste navegador", { exact: true })).toHaveValue(legacy.id);
  await expect(page.getByText(/Quem usa este navegador pode abrir/)).toBeVisible();
  await page.getByRole("button", { name: "Continuar com este perfil", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Minha frequência", exact: true })).toBeVisible();
});
