import { test, expect, type Page } from "@playwright/test";

const user = {
  id: "redesign-profile",
  name: "Participante de teste com nome bastante comprido para verificar a apresentação",
  role: "Estudante",
  gatNumber: "04",
  gatName: "Mangaba",
  createdAt: "2026-10-01T00:00:00.000Z",
};
const activity = {
  id: "redesign-activity", date: "2026-11-30", start: "14:00", end: "15:30",
  description: "Descrição longa da atividade para conferir a apresentação em telas pequenas e também quando há muito conteúdo registrado.",
  modality: "Síncrona virtual", hours: 2,
};

async function seedProfile(page: Page) {
  await page.clock.install({ time: new Date("2026-11-12T15:00:00Z") });
  await page.addInitScript(({ user, activity }) => {
    if (sessionStorage.getItem("redesign-seeded")) return;
    localStorage.setItem("pet_folha_profiles_v2", JSON.stringify([user]));
    localStorage.setItem("pet_folha_active_profile_id_v2", user.id);
    localStorage.setItem(`pet_folha_activities_v2_${user.id}_2026-11`, JSON.stringify([activity]));
    sessionStorage.setItem("redesign-seeded", "1");
  }, { user, activity });
}

async function openAccount(page: Page) {
  await expect(page.getByRole("heading", { name: "Frequência", exact: true })).toBeVisible();
  const avatar = page.getByRole("button", { name: "Abrir Conta" });
  if (await avatar.isVisible()) {
    await avatar.click();
    await expect(page.getByRole("heading", { name: "Conta", exact: true })).toBeVisible();
  } else {
    await page.locator(".profile-trigger").click();
    await expect(page.locator("#profile-menu")).toBeVisible();
  }
}

test("entrada apresenta passos, permite pular e lembra a escolha", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("img", { name: "Passo 1 de 3" })).toBeVisible();
  await page.locator(".onboarding-steps").getByRole("button", { name: "Como funciona" }).click();
  await expect(page.getByRole("img", { name: "Passo 2 de 3" })).toBeVisible();
  await page.locator(".onboarding-steps").getByRole("button", { name: "Continuar", exact: true }).click();
  await expect(page.getByLabel("Nome completo", { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Nome completo", { exact: true })).toBeVisible();
  await expect(page.getByRole("img", { name: "Passo 1 de 3" })).toHaveCount(0);

  await page.evaluate(() => localStorage.removeItem("pet_folha_onboarding_seen"));
  await page.reload();
  await page.getByRole("button", { name: "Pular", exact: true }).click();
  await expect(page.getByLabel("Nome completo", { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Nome completo", { exact: true })).toBeVisible();
});

test("tema claro inicial e preferência Sistema acompanham o aparelho e persistem", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await seedProfile(page);
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await openAccount(page);
  const options = page.getByRole("group", { name: "Tema" }).filter({ visible: true });
  await options.getByRole("button", { name: "Sistema" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme-preference", "system");
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

test("Minhas folhas muda mês e o resumo semanal permanece após recarregar", async ({ page }) => {
  await seedProfile(page);
  await page.goto("/");
  const summary = page.getByRole("region", { name: "Resumo da frequência" });
  await summary.getByRole("button", { name: "Semanal" }).click();
  await expect(summary.getByRole("progressbar", { name: /Dias 30 a 30/ })).toHaveAttribute("aria-valuenow", "2");
  await page.reload();
  await expect(summary.getByRole("button", { name: "Semanal" })).toHaveAttribute("aria-pressed", "true");
  await summary.getByRole("button", { name: "Mensal" }).click();
  await openAccount(page);
  await page.locator("#profile-menu, .account-screen").getByText("Minhas folhas", { exact: true }).filter({ visible: true }).click();
  const sheets = page.getByRole("dialog", { name: "Minhas folhas" });
  await sheets.getByRole("button", { name: /Outubro\/2026/ }).click();
  await expect(page.getByLabel("Mês da folha")).toHaveValue("2026-10");
  await expect(page.getByRole("heading", { name: "Folha", exact: true })).toBeVisible();
});

test("novidades abre pelo sino, fecha com Escape e devolve foco", async ({ page }) => {
  await seedProfile(page);
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "Novidades", exact: true });
  await trigger.focus();
  await page.keyboard.press("Enter");
  const region = page.getByRole("region", { name: "Novidades" });
  await expect(region).toBeVisible();
  await expect(page.getByRole("button", { name: "Fechar novidades" })).toHaveAttribute("aria-expanded", "true");
  await expect(region.getByRole("button", { name: /fechar/i })).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(region).toBeHidden();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await expect(region).toBeVisible();
  await page.getByRole("button", { name: "Fechar novidades" }).click();
  await expect(region).toBeHidden();
});

test("interface com conteúdo longo cabe em larguras e temas com movimento reduzido", async ({ page }) => {
  await seedProfile(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  for (const width of [360, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const theme of ["light", "dark"]) {
      await page.evaluate((value) => {
        localStorage.setItem("pet_theme", value);
        document.documentElement.dataset.theme = value;
      }, theme);
      await expect(page.getByRole("heading", { name: "Frequência", exact: true })).toBeVisible();
      const overflow = await page.evaluate(() => ({ width: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }));
      expect(overflow.content, `${width}px ${theme}`).toBeLessThanOrEqual(overflow.width + 1);
      const summary = page.getByRole("region", { name: "Resumo da frequência" });
      await expect(summary).toBeVisible();
      const box = await summary.boundingBox();
      expect(box, `${width}px ${theme} summary`).not.toBeNull();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(width + 1);
    }
  }
});

async function addRedesignActivity(page: Page, description: string) {
  const trigger = page.locator("#add-activity-trigger");
  if (await trigger.isVisible()) await trigger.click();
  await page.getByLabel("Atividade realizada", { exact: true }).fill(description);
  await page.getByLabel("Data", { exact: true }).fill("2026-11-12");
  await page.getByLabel("Entrada", { exact: true }).fill("14:00");
  await page.getByLabel("Saída", { exact: true }).fill("15:30");
  await page.getByRole("button", { name: "Adicionar atividade", exact: true }).filter({ visible: true }).click();
}

async function storedDescriptions(page: Page): Promise<string[]> {
  return page.evaluate((id) => {
    const entries = JSON.parse(localStorage.getItem(`pet_folha_activities_v2_${id}_2026-11`) || "[]");
    return entries.map((entry: { description: string }) => entry.description);
  }, user.id);
}

test("desfazer altera só a última atividade e expira ao mudar de seção", async ({ page }) => {
  await seedProfile(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Frequência", exact: true })).toBeVisible();
  await addRedesignActivity(page, "Primeira atividade adicionada");
  await expect(page.getByText("Primeira atividade adicionada", { exact: true }).filter({ visible: true }).first()).toBeVisible();
  expect(await storedDescriptions(page)).toContain("Primeira atividade adicionada");
  await page.getByRole("button", { name: "Desfazer" }).click();
  await expect(page.getByText("Primeira atividade adicionada", { exact: true })).toHaveCount(0);
  expect(await storedDescriptions(page)).toEqual([activity.description]);

  await addRedesignActivity(page, "Registro preservado após troca");
  await expect(page.getByRole("button", { name: "Desfazer" })).toBeVisible();
  expect(await storedDescriptions(page)).toContain("Registro preservado após troca");
  await page.getByRole("button", { name: "Folha", exact: true }).filter({ visible: true }).click();
  await expect(page.getByRole("button", { name: "Desfazer" })).toHaveCount(0);
  expect(await storedDescriptions(page)).toContain("Registro preservado após troca");
  await page.clock.fastForward(5_100);
  await expect(page.locator(".pet-toast")).toHaveCount(0);
  expect(await storedDescriptions(page)).toContain("Registro preservado após troca");
});

test("lembretes mostram cópia pendente e explicam semana parcial", async ({ page }) => {
  await seedProfile(page);
  await page.clock.setSystemTime(new Date("2026-11-30T15:00:00Z"));
  await page.goto("/");
  const notices = page.locator(".local-notices");
  await notices.locator("summary").click();
  await expect(notices).toContainText("De 30 a 30: 2 de 8 h de referência");
  await expect(notices).toContainText("Confira também as atividades fora deste mês");
  await expect(notices).not.toContainText("Há alterações nesta sessão");
  await addRedesignActivity(page, "Registro para aviso de cópia");
  await expect(notices.locator("summary")).toContainText("cópia pendente");
  await expect(notices).toContainText("Há alterações nesta sessão desde a última cópia.");
  await expect(notices.getByRole("button", { name: "Salvar cópia agora" })).toBeVisible();
});

test("Minhas folhas preserva rascunho ao cancelar descarte do mês atual", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await seedProfile(page);
  await page.goto("/");
  const description = page.getByLabel("Atividade realizada", { exact: true });
  await description.fill("Rascunho que deve continuar disponível");
  await page.getByLabel("Entrada", { exact: true }).fill("14:00");
  await page.locator(".profile-trigger").click();
  await page.getByRole("menuitem", { name: "Minhas folhas" }).click();
  const sheets = page.getByRole("dialog", { name: "Minhas folhas" });
  await sheets.getByRole("button", { name: /Novembro\/2026/ }).click();
  const confirmation = page.getByRole("dialog", { name: "Atividade ainda não adicionada" });
  await expect(confirmation).toBeVisible();
  await confirmation.getByRole("button", { name: "Continuar editando" }).click();
  await expect(sheets).toBeVisible();
  await sheets.getByRole("button", { name: "Voltar", exact: true }).click();
  await expect(description).toHaveValue("Rascunho que deve continuar disponível");
  await expect(page.getByLabel("Entrada", { exact: true })).toHaveValue("14:00");
  await expect(page.getByLabel("Mês da folha")).toHaveValue("2026-11");
  await expect(page.getByRole("heading", { name: "Frequência", exact: true })).toBeVisible();
});
