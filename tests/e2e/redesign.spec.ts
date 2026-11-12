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
  await expect(region).not.toContainText(/sino.*fechar/i);
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

test("frequência não repete identificação nem mostra lembretes", async ({ page }) => {
  await seedProfile(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Frequência", exact: true })).toBeVisible();
  await expect(page.getByText("Lembretes da folha", { exact: false })).toHaveCount(0);
  await expect(page.locator(".app-topbar")).not.toContainText(user.name);
  await expect(page.locator(".profile-trigger")).toHaveCount(1);
  const trigger = page.locator("#add-activity-trigger");
  if (await trigger.isVisible()) await trigger.click();
  await expect(page.getByLabel("Modelo", { exact: true })).toBeVisible();
});

test("rodapé mantém tipografia uniforme em links e botões", async ({ page }) => {
  await page.goto("/");
  const footer = page.locator(".entry-page .site-footer");
  await expect(footer).toBeVisible();
  const styles = await footer.locator("a, button").evaluateAll((elements) => elements.map((element) => {
    const style = getComputedStyle(element);
    return { size: style.fontSize, line: style.lineHeight, weight: style.fontWeight };
  }));
  expect(styles.length).toBeGreaterThan(2);
  for (const style of styles) {
    expect(style.size).toBe("14px");
    expect(style.line).toBe("21px");
    expect(style.weight).toBe(styles[0].weight);
  }
});

test("opções de acesso mantêm a mesma área ao trocar", async ({ page }) => {
  await page.addInitScript((profile) => {
    localStorage.setItem("pet_folha_profiles_v2", JSON.stringify([profile]));
    localStorage.removeItem("pet_folha_active_profile_id_v2");
    localStorage.setItem("pet_folha_onboarding_seen", "1");
  }, user);
  await page.goto("/");
  const frame = page.locator("#acesso .ui-frame");
  const choices = page.getByRole("group", { name: "Como deseja começar" });
  await expect(choices).toBeVisible();
  const sizes = [];
  for (const name of ["Continuar", "Primeiro acesso", "Restaurar cópia"]) {
    await choices.getByRole("button", { name, exact: true }).click();
    const box = await frame.boundingBox();
    expect(box).not.toBeNull();
    sizes.push(box!);
  }
  for (const box of sizes) {
    expect(Math.abs(box.width - sizes[0].width)).toBeLessThanOrEqual(1);
    expect(Math.abs(box.height - sizes[0].height)).toBeLessThanOrEqual(1);
    expect(box.width).toBeLessThanOrEqual(page.viewportSize()!.width);
    expect(box.height).toBeGreaterThanOrEqual(500);
  }
  if (page.viewportSize()!.width >= 900) expect(sizes[0].width).toBeCloseTo(720, 0);
});

test("janelas usam largura coerente e cabem na tela", async ({ page }) => {
  await seedProfile(page);
  await page.goto("/");
  await openAccount(page);
  const avatar = page.getByRole("button", { name: "Abrir Conta" });
  if (await avatar.isVisible()) await page.getByRole("button", { name: "Meu perfil", exact: true }).click();
  else await page.getByRole("menuitem", { name: "Meu perfil" }).click();
  const profile = page.getByRole("dialog", { name: "Identificação do participante" });
  await expect(profile).toBeVisible();
  const profileBox = await profile.boundingBox();
  expect(profileBox).not.toBeNull();
  expect(profileBox!.width).toBeLessThanOrEqual(page.viewportSize()!.width);
  if (page.viewportSize()!.width >= 900) expect(profileBox!.width).toBeCloseTo(720, 0);
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Avaliar", exact: true }).click();
  const feedback = page.getByRole("dialog", { name: "Avaliação e sugestões" });
  await expect(feedback).toBeVisible();
  const feedbackBox = await feedback.boundingBox();
  expect(feedbackBox).not.toBeNull();
  expect(feedbackBox!.width).toBeLessThanOrEqual(page.viewportSize()!.width);
  if (page.viewportSize()!.width >= 900) {
    expect(feedbackBox!.width).toBeCloseTo(profileBox!.width, 0);
    const contents = await feedback.locator(":scope > div").boundingBox();
    expect(contents!.width).toBeCloseTo(feedbackBox!.width, 0);
  }
  await page.keyboard.press("Escape");
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

test("navegação e menus cabem na tela e o perfil acompanha o rodapé", async ({ page }, testInfo) => {
  await seedProfile(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Frequência", exact: true })).toBeVisible();
  if (testInfo.project.name === "desktop") {
    for (const width of [1000, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      const sidebar = page.locator(".app-sidebar");
      const footer = page.locator(".dashboard-shell > .site-footer");
      const profile = page.locator(".profile-trigger");
      await footer.scrollIntoViewIfNeeded();
      const sidebarBox = await sidebar.boundingBox();
      const footerBox = await footer.boundingBox();
      expect(sidebarBox!.width).toBe(width === 1440 ? 304 : 280);
      expect(footerBox!.width).toBe(width);
      expect(Math.abs(sidebarBox!.y + sidebarBox!.height - footerBox!.y)).toBeLessThanOrEqual(2);
      await profile.click();
      const menu = page.locator("#profile-menu");
      const menuBox = await menu.boundingBox();
      expect(menuBox!.x).toBeGreaterThanOrEqual(sidebarBox!.x);
      expect(menuBox!.x + menuBox!.width).toBeLessThanOrEqual(sidebarBox!.x + sidebarBox!.width);
      const triggerBox = await profile.boundingBox();
      expect(menuBox!.y + menuBox!.height).toBeLessThanOrEqual(triggerBox!.y);
      await page.keyboard.press("Escape");
    }
  } else {
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize()!.width);
  }
});

test("opções da entrada são acessíveis por teclado", async ({ page }) => {
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "Mais opções" });
  await trigger.focus();
  await page.keyboard.press("Enter");
  const panel = page.getByRole("region", { name: "Mais opções" });
  await expect(panel.getByRole("button", { name: "Ajuda", exact: true })).toBeVisible();
  await expect(panel.getByRole("button", { name: /Ativar tema/ })).toBeVisible();
  await expect(panel.getByRole("button", { name: "Configurações locais" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(panel).toBeHidden();
  await expect(trigger).toBeFocused();
});
