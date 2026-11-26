import { test, expect, type Page, type Route } from "@playwright/test";

// Login com Google e cópia no Drive, com as rotas do servidor e a API do Drive simuladas.
const SUB = "google-sub-123";
const sessionUser = { sub: SUB, email: "ana@exemplo.com", name: "Ana Souza" };

interface FakeFile {
  id: string;
  name: string;
  mimeType: string;
  parents?: string[];
  appProperties: Record<string, string>;
  content?: string;
  modifiedTime: string;
  trashed?: boolean;
}

class FakeDrive {
  files = new Map<string, FakeFile>();
  private seq = 0;
  private clock = Date.parse("2026-11-20T12:00:00Z");
  private stamp() {
    this.clock += 1000;
    return new Date(this.clock).toISOString();
  }
  create(meta: Partial<FakeFile>, content?: string) {
    const file: FakeFile = {
      id: `f${++this.seq}`,
      name: meta.name ?? "sem nome",
      mimeType: meta.mimeType ?? "application/json",
      parents: meta.parents,
      appProperties: meta.appProperties ?? {},
      content,
      modifiedTime: this.stamp(),
    };
    this.files.set(file.id, file);
    return file;
  }
  update(id: string, meta: Partial<FakeFile>, content?: string) {
    const file = this.files.get(id)!;
    Object.assign(file, { ...meta, appProperties: { ...file.appProperties, ...meta.appProperties } });
    if (content !== undefined) file.content = content;
    file.modifiedTime = this.stamp();
    return file;
  }
  byProp(key: string, value: string) {
    return [...this.files.values()].filter((file) => !file.trashed && file.appProperties[key] === value);
  }
}

function monthCopy(monthKey: string, activities: object[], user = { id: "perfil-drive", name: "Ana Souza", role: "Estudante", gatNumber: "04", gatName: "Mangaba", createdAt: "2026-08-03T00:00:00.000Z" }) {
  return JSON.stringify({ version: "1.3", attachments: [], exportedAt: "2026-11-20T12:00:00Z", user, monthKey, activities });
}

function parseMultipart(body: string, contentType: string) {
  const boundary = /boundary=([^;]+)/.exec(contentType)![1];
  const parts = body.split(`--${boundary}`).slice(1, -1).map((part) => part.split("\r\n\r\n").slice(1).join("\r\n\r\n").replace(/\r\n$/, ""));
  return { meta: JSON.parse(parts[0]), content: parts[1] };
}

async function mockGoogle(page: Page, drive: FakeDrive, session: { authenticated: boolean }) {
  const state = { ...session, loggedOut: false };
  await page.route("**/api/google/session", (route) =>
    route.fulfill({ json: state.authenticated && !state.loggedOut ? { configured: true, authenticated: true, ...sessionUser } : { configured: true, authenticated: false } }));
  await page.route("**/api/google/token", (route) => route.fulfill({ json: { accessToken: "token-de-teste", expiresAt: Date.now() + 3_600_000 } }));
  await page.route("**/api/google/logout", (route) => {
    state.loggedOut = true;
    return route.fulfill({ json: { ok: true } });
  });
  await page.route("https://www.googleapis.com/**", async (route: Route) => {
    const request = route.request();
    const url = new URL(request.url());
    const method = request.method();
    const id = /\/files\/([^/?]+)/.exec(url.pathname)?.[1];
    if (url.pathname.startsWith("/upload/drive/v3/files")) {
      const { meta, content } = parseMultipart(request.postData() ?? "", request.headers()["content-type"]);
      const file = id ? drive.update(id, meta, content) : drive.create(meta, content);
      return route.fulfill({ json: { id: file.id, modifiedTime: file.modifiedTime } });
    }
    if (url.pathname === "/drive/v3/files" && method === "GET") {
      const q = url.searchParams.get("q") ?? "";
      const value = /key='petFolha' and value='(\w+)'/.exec(q)?.[1] ?? "";
      const files = drive.byProp("petFolha", value).map((file) => ({ ...file, content: undefined, size: String(file.content?.length ?? 0) }));
      return route.fulfill({ json: { files } });
    }
    if (url.pathname === "/drive/v3/files" && method === "POST") {
      const file = drive.create(JSON.parse(request.postData() ?? "{}"));
      return route.fulfill({ json: { id: file.id } });
    }
    if (id && method === "GET") {
      const file = drive.files.get(id);
      if (!file) return route.fulfill({ status: 404, json: {} });
      if (url.searchParams.get("alt") === "media") return route.fulfill({ body: file.content ?? "", contentType: "application/json" });
      return route.fulfill({ json: { ...file, content: undefined } });
    }
    return route.fulfill({ status: 400, json: { error: `não simulado: ${method} ${url.pathname}` } });
  });
  return state;
}

async function seedLocal(page: Page, profile?: object, monthKey?: string, activities?: object[], extra: Record<string, string> = {}) {
  await page.clock.install({ time: new Date("2026-11-23T15:00:00Z") });
  await page.addInitScript(({ profile, monthKey, activities, extra }) => {
    if (sessionStorage.getItem("google-sync-seeded")) return;
    localStorage.setItem("pet_folha_onboarding_seen", "1");
    if (profile) {
      localStorage.setItem("pet_folha_profiles_v2", JSON.stringify([profile]));
      localStorage.setItem(`pet_folha_activities_v2_${(profile as { id: string }).id}_${monthKey}`, JSON.stringify(activities ?? []));
    } else localStorage.setItem("pet_folha_profiles_v2", "[]");
    for (const [key, value] of Object.entries(extra)) localStorage.setItem(key, value);
    sessionStorage.setItem("google-sync-seeded", "1");
  }, { profile, monthKey, activities, extra });
}

const reuniao = { id: "a1", date: "2026-11-10", start: "14:00", end: "15:30", modality: "Síncrona virtual", description: "Reunião do GAT 04 (Mangaba)", hours: 2 };

test("sem sessão Google, a entrada pede login", async ({ page }) => {
  const drive = new FakeDrive();
  await seedLocal(page);
  await mockGoogle(page, drive, { authenticated: false });
  await page.goto("/");
  const login = page.getByRole("link", { name: "Fazer login com o Google" });
  await expect(login).toBeVisible();
  await expect(login).toHaveAttribute("href", "/api/google/login");
  await expect(page.getByRole("link", { name: "Política de privacidade" })).toHaveAttribute("href", "/privacidade");
});

test("conta nova cria a folha e envia o mês ao Drive", async ({ page }) => {
  const drive = new FakeDrive();
  await seedLocal(page);
  await mockGoogle(page, drive, { authenticated: true });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Complete seu cadastro" })).toBeVisible();
  await expect(page.getByLabel("Nome completo")).toHaveValue("Ana Souza");
  await page.getByRole("button", { name: "Começar minha folha" }).click();
  await expect(page.getByRole("heading", { name: "Frequência", exact: true })).toBeVisible();

  await page.getByLabel("Atividade realizada", { exact: true }).fill("Oficina de audiodescrição");
  await page.getByLabel("Data", { exact: true }).fill("2026-11-23");
  await page.getByLabel("Entrada", { exact: true }).fill("14:00");
  await page.getByLabel("Saída", { exact: true }).fill("15:30");
  await page.getByRole("button", { name: "Adicionar atividade", exact: true }).filter({ visible: true }).click();
  await page.clock.runFor(4000);

  await expect.poll(() => drive.byProp("petFolha", "month").length).toBe(1);
  const [month] = drive.byProp("petFolha", "month");
  expect(month.appProperties.monthKey).toBe("2026-11");
  expect(month.parents).toEqual([drive.byProp("petFolha", "root")[0].id]);
  expect(JSON.parse(month.content!).activities[0].description).toBe("Oficina de audiodescrição");
  expect(JSON.parse(month.content!).user.googleSub).toBe(SUB);
  await expect(page.getByRole("status").filter({ hasText: "Salvo no Drive" }).first()).toBeVisible();
});

test("outro aparelho traz os meses do Drive", async ({ page }) => {
  const drive = new FakeDrive();
  const folder = drive.create({ name: "PET Folha", mimeType: "application/vnd.google-apps.folder", appProperties: { petFolha: "root" } });
  drive.create({ name: "PET Folha - Ana Souza - 2026-11.json", parents: [folder.id], appProperties: { petFolha: "month", monthKey: "2026-11", profileId: "perfil-drive" } }, monthCopy("2026-11", [reuniao]));
  await seedLocal(page);
  await mockGoogle(page, drive, { authenticated: true });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Bem-vindo\(a\) de volta, Ana/ })).toBeVisible();
  await page.getByRole("button", { name: "Abrir minha folha" }).click();
  await expect(page.getByRole("heading", { name: "Frequência", exact: true })).toBeVisible();
  await expect(page.getByText("Reunião do GAT 04 (Mangaba)").filter({ visible: true }).first()).toBeVisible();
  const profiles = await page.evaluate(() => JSON.parse(localStorage.getItem("pet_folha_profiles_v2") ?? "[]"));
  expect(profiles[0].googleSub).toBe(SUB);
});

test("folha que já estava no navegador é vinculada e enviada", async ({ page }) => {
  const drive = new FakeDrive();
  const local = { id: "perfil-local", name: "Ana Souza", role: "Estudante", gatNumber: "04", gatName: "Mangaba", createdAt: "2026-08-03T00:00:00.000Z" };
  await seedLocal(page, local, "2026-11", [reuniao]);
  await mockGoogle(page, drive, { authenticated: true });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Encontramos uma folha aqui" })).toBeVisible();
  await page.getByRole("button", { name: "Vincular à minha conta" }).click();
  await expect(page.getByRole("heading", { name: "Frequência", exact: true })).toBeVisible();
  await expect.poll(() => drive.byProp("petFolha", "month").map((file) => file.appProperties.monthKey)).toEqual(["2026-11"]);
});

test("conflito entre aparelhos guarda a versão descartada", async ({ page }) => {
  const drive = new FakeDrive();
  const folder = drive.create({ name: "PET Folha", mimeType: "application/vnd.google-apps.folder", appProperties: { petFolha: "root" } });
  const remote = drive.create({ name: "PET Folha - Ana Souza - 2026-11.json", parents: [folder.id], appProperties: { petFolha: "month", monthKey: "2026-11", profileId: "perfil-local" } }, monthCopy("2026-11", [reuniao]));
  const local = { id: "perfil-local", name: "Ana Souza", role: "Estudante", gatNumber: "04", gatName: "Mangaba", googleSub: SUB, createdAt: "2026-08-03T00:00:00.000Z" };
  const syncState = { [SUB]: { folderId: folder.id, months: { "2026-11": { fileId: remote.id, remoteModified: "2026-11-01T00:00:00.000Z", dirty: true } } } };
  await seedLocal(page, local, "2026-11", [reuniao, { ...reuniao, id: "a2", date: "2026-11-12", description: "Produção de material em Braille" }], {
    pet_folha_active_profile_id_v2: "perfil-local",
    pet_folha_drive_sync_v1: JSON.stringify(syncState),
  });
  await mockGoogle(page, drive, { authenticated: true });
  await page.goto("/");
  const dialog = page.getByRole("dialog", { name: "Novembro/2026 mudou em dois lugares" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText("2 atividades · 4 h")).toBeVisible();
  await dialog.getByRole("button", { name: "Continuar com este aparelho" }).click();
  await expect(dialog).toBeHidden();
  await expect.poll(() => drive.byProp("petFolha", "conflict").length).toBe(1);
  await expect.poll(() => JSON.parse(drive.files.get(remote.id)!.content!).activities.length).toBe(2);
});

test("sair da conta pode apagar os dados deste aparelho", async ({ page }) => {
  const drive = new FakeDrive();
  const local = { id: "perfil-local", name: "Ana Souza", role: "Estudante", gatNumber: "04", gatName: "Mangaba", googleSub: SUB, createdAt: "2026-08-03T00:00:00.000Z" };
  await seedLocal(page, local, "2026-11", [reuniao], { pet_folha_active_profile_id_v2: "perfil-local" });
  await mockGoogle(page, drive, { authenticated: true });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Frequência", exact: true })).toBeVisible();
  await expect.poll(() => drive.byProp("petFolha", "month").length).toBe(1);
  const avatar = page.getByRole("button", { name: "Abrir Conta" });
  if (await avatar.isVisible()) {
    await avatar.click();
    await page.locator(".account-screen").getByRole("button", { name: "Sair" }).click();
  } else {
    await page.locator(".profile-trigger").click();
    await page.getByRole("menuitem", { name: "Sair" }).click();
  }
  const dialog = page.getByRole("dialog", { name: "Sair da conta" });
  await expect(dialog.getByText(/Tudo está salvo/)).toBeVisible();
  await dialog.getByLabel(/Apagar os dados deste aparelho/).check();
  await dialog.getByRole("button", { name: /Sair da conta/ }).click();
  await expect(page.getByRole("link", { name: "Fazer login com o Google" })).toBeVisible();
  const stored = await page.evaluate(() => ({
    profiles: localStorage.getItem("pet_folha_profiles_v2"),
    month: localStorage.getItem("pet_folha_activities_v2_perfil-local_2026-11"),
  }));
  expect(JSON.parse(stored.profiles ?? "[]")).toEqual([]);
  expect(stored.month).toBeNull();
});
