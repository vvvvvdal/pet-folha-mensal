import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import Module, { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test, { afterEach } from "node:test";
afterEach(() => {
  delete globalThis.window;
});

// Compile the real TS/TSX modules in memory. No browser, network, or user records.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const load = createRequire(path.join(root, "package.json"));
const ts = load("typescript");
const originalResolve = Module._resolveFilename;
Module._resolveFilename = function (name, ...args) {
  return originalResolve.call(
    this,
    name.startsWith("@/") ? path.join(root, "src", name.slice(2)) : name,
    ...args,
  );
};
for (const ext of [".ts", ".tsx"]) {
  Module._extensions[ext] = (module, filename) => {
    const source = readFileSync(filename, "utf8");
    const result = ts.transpileModule(source, {
      fileName: filename,
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
        target: ts.ScriptTarget.ES2020,
      },
    });
    module._compile(result.outputText, filename);
  };
}
const React = load("react");
const { renderToStaticMarkup } = load("react-dom/server");
const { calcPetHours } = load("./src/lib/pet-calculator.ts");
const storage = load("./src/lib/storage.ts");
const { DEFAULT_GATS, DEFAULT_ROLES } = load("./src/types/index.ts");
const { SystemPreview } = load("./src/components/SystemPreview.tsx");
const { LandingPage } = load("./src/components/LandingPage.tsx");
const { FAQ, HelpModal } = load("./src/components/Help.tsx");
const { DialogProvider } = load("./src/context/DialogContext.tsx");
const { Navbar } = load("./src/components/Navbar.tsx");
const { ActivityForm } = load("./src/components/ActivityForm.tsx");
const { ActivityTable } = load("./src/components/ActivityTable.tsx");
const { EditActivityModal } = load("./src/components/EditActivityModal.tsx");
const { ProfileModal } = load("./src/components/ProfileModal.tsx");
const { ExitModal } = load("./src/components/ExitModal.tsx");
const { OfficialSheet } = load("./src/components/OfficialSheet.tsx");
const noop = () => {};
const render = (element) =>
  renderToStaticMarkup(React.createElement(DialogProvider, null, element));
const sampleUser = {
  id: "test-ui",
  name: "Participante de teste",
  role: "Estudante",
  gatNumber: "04",
  gatName: "Mangaba",
  createdAt: "2026-10-01T00:00:00.000Z",
};
const sampleActivity = {
  id: "test-activity",
  date: "2026-10-06",
  start: "14:00",
  end: "15:30",
  modality: "Síncrona virtual",
  description: "Atividade de teste",
  hours: 2,
};
function isolatedStorage() {
  const records = new Map();
  globalThis.window = {};
  globalThis.localStorage = {
    getItem: (key) => records.get(key) ?? null,
    setItem: (key, value) => records.set(key, String(value)),
    removeItem: (key) => records.delete(key),
    clear: () => records.clear(),
  };
  return records;
}

test("cálculo oficial: frações, horários iguais e intervalos inválidos", () => {
  assert.equal(calcPetHours("14:00", "15:30"), 2);
  assert.equal(calcPetHours("13:30", "17:30"), 5);
  assert.equal(calcPetHours("19:00", "20:40"), 2);
  assert.equal(calcPetHours("14:00", "14:00"), 0);
  assert.equal(calcPetHours("15:00", "14:00"), 0);
  assert.equal(calcPetHours("", ""), 0);
});

test("perfil novo, inclusão, edição, exclusão e isolamento por mês e participante", () => {
  isolatedStorage();
  const result = storage.registerProfile({
    name: sampleUser.name,
    role: sampleUser.role,
    gatNumber: "04",
  });
  assert.equal(result.success, true);
  const user = result.user;
  assert.deepEqual(storage.getActivitiesForMonth(user.id, "2026-10"), []);
  storage.saveActivitiesForMonth(user.id, "2026-10", [sampleActivity]);
  assert.equal(storage.getActivitiesForMonth(user.id, "2026-10")[0].hours, 2);
  storage.saveActivitiesForMonth(user.id, "2026-10", [
    { ...sampleActivity, end: "17:30", hours: calcPetHours("14:00", "17:30") },
  ]);
  assert.equal(storage.getActivitiesForMonth(user.id, "2026-10")[0].hours, 4);
  assert.deepEqual(storage.getActivitiesForMonth(user.id, "2026-11"), []);
  assert.deepEqual(
    storage.getActivitiesForMonth("outro-perfil", "2026-10"),
    [],
  );
  storage.clearActivitiesForMonth(user.id, "2026-10");
  assert.deepEqual(storage.getActivitiesForMonth(user.id, "2026-10"), []);
});

test("cópia de segurança mantém o formato e restaura o perfil e suas atividades", () => {
  isolatedStorage();
  storage.saveProfiles([sampleUser]);
  storage.saveActivitiesForMonth(sampleUser.id, "2026-10", [sampleActivity]);
  const backup = storage.exportUserData(sampleUser, "2026-10");
  assert.equal(JSON.parse(backup).version, "1.0");
  localStorage.clear();
  const result = storage.importUserData(backup);
  assert.equal(result.success, true);
  assert.equal(result.monthKey, "2026-10");
  assert.deepEqual(storage.getActivitiesForMonth(sampleUser.id, "2026-10"), [
    sampleActivity,
  ]);
  assert.equal(storage.getActiveProfile().name, sampleUser.name);
  storage.setActiveProfileId(null);
  assert.equal(storage.getActiveProfile(), null);
});

test("arquivos inválidos não alteram os registros existentes", () => {
  const records = isolatedStorage();
  storage.saveProfiles([sampleUser]);
  const before = JSON.stringify([...records]);
  for (const invalid of ["não é json", "{}", '{"user":{"name":"Teste"}}'])
    assert.equal(storage.importUserData(invalid).success, false);
  assert.equal(JSON.stringify([...records]), before);
});

test("prévia é somente visual e não acessa nem grava armazenamento", () => {
  const originalWindow = globalThis.window;
  const originalStorage = globalThis.localStorage;
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    get() {
      throw new Error("A prévia não pode acessar registros");
    },
  });
  try {
    delete globalThis.window;
    const html = renderToStaticMarkup(React.createElement(SystemPreview));
    assert.match(html, /Exemplo · dados fictícios/);
    assert.doesNotMatch(html, /<(button|input|select|a)\b/);
    assert.equal((html.match(/class="preview-row"/g) || []).length, 3);
  } finally {
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      writable: true,
      value: originalStorage,
    });
    globalThis.window = originalWindow;
  }
});

function verifyLabelTargets(html) {
  for (const [, id] of html.matchAll(/<label[^>]*for="([^"]+)"/g))
    assert.ok(html.includes('id="' + id + '"'), "Campo ausente: " + id);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(
    new Set(ids).size,
    ids.length,
    "Os campos devem ter identificadores únicos",
  );
}

test("entrada apresenta acesso antes da prévia e do FAQ, com rótulos associados", () => {
  const html = render(
    React.createElement(LandingPage, {
      onLoginWithJson: noop,
      onCreateProfile: noop,
      gats: DEFAULT_GATS,
      roles: DEFAULT_ROLES,
      onOpenAdmin: noop,
      onOpenFeedback: noop,
    }),
  );
  assert.ok(html.indexOf('id="acesso"') < html.indexOf('id="previa"'));
  assert.ok(html.indexOf('id="previa"') < html.indexOf('id="perguntas"'));
  verifyLabelTargets(html);
  assert.match(html, /Felipe Vidal/);
  assert.match(html, /Robert Taveira/);
  assert.doesNotMatch(html, /hubfrequencia@gmail.com|Ver preços/);
});

test("FAQ compartilhado tem seis perguntas e ajuda usa o diálogo comum", () => {
  const html = renderToStaticMarkup(React.createElement(FAQ));
  assert.equal((html.match(/<details>/g) || []).length, 6);
  const help = render(
    React.createElement(HelpModal, { isOpen: true, onClose: noop }),
  );
  assert.match(help, /<dialog/);
  assert.match(help, /class="pet-dialog screen-only"/);
  assert.equal((help.match(/<details>/g) || []).length, 6);
});

test("painel mantém backup acessível sem ocultar ações em telas menores", () => {
  const html = render(
    React.createElement(Navbar, {
      user: sampleUser,
      activeTab: "dashboard",
      onTabChange: noop,
      onOpenProfileModal: noop,
      hasChanges: true,
      onExportBackup: noop,
      onImportBackup: noop,
      onOpenAdmin: noop,
      onOpenExitModal: noop,
      onOpenFeedback: noop,
      onOpenHelp: noop,
    }),
  );
  assert.match(html, /Salvar cópia/);
  assert.match(html, /Restaurar cópia/);
  assert.match(html, /aria-pressed="true"/);
  assert.doesNotMatch(html, /hidden (?:lg|md):flex/);
});

test("formulários e modais renderizam com campos rotulados e diálogos nativos", () => {
  const form = render(
    React.createElement(ActivityForm, {
      onSave: noop,
      templates: storage.DEFAULT_TEMPLATES,
    }),
  );
  verifyLabelTargets(form);
  for (const field of ["Data", "Entrada", "Saída"])
    assert.match(form, new RegExp('<label[^>]*for="[^"]+"[^>]*>' + field));
  const components = [
    [
      EditActivityModal,
      { activity: sampleActivity, onSave: noop, templates: [] },
    ],
    [
      ProfileModal,
      {
        currentUser: sampleUser,
        allProfiles: [sampleUser],
        gats: DEFAULT_GATS,
        roles: DEFAULT_ROLES,
        onSaveProfile: noop,
      },
    ],
    [
      ExitModal,
      {
        userName: sampleUser.name,
        onConfirmExit: noop,
        onDownloadJson: noop,
        onDownloadPdf: noop,
      },
    ],
  ];
  for (const [Component, props] of components) {
    const html = render(
      React.createElement(Component, { ...props, isOpen: true, onClose: noop }),
    );
    verifyLabelTargets(html);
    assert.match(html, /<dialog/);
    assert.match(html, /aria-label="/);
  }
});

test("folha oficial mantém estrutura, horas e áreas de assinatura", () => {
  const html = renderToStaticMarkup(
    React.createElement(OfficialSheet, {
      user: sampleUser,
      monthLabel: "Outubro/2026",
      activities: [sampleActivity],
      totalHours: 2,
    }),
  );
  assert.match(html, /TOTAL: 2 horas/);
  assert.match(html, /Assinatura do Participante/);
  assert.match(html, /Assinatura da Supervisão do GAT/);
  assert.equal(
    (html.match(/<tbody>[\s\S]*?<\/tbody>/)?.[0].match(/<tr/g) || []).length,
    10,
  );
  assert.doesNotMatch(
    html,
    /Perguntas frequentes|site-footer|Exemplo · dados fictícios/,
  );
});

test("CSS mantém impressão A4 paisagem isolada, temas e redução de movimento", () => {
  const css = readFileSync(path.join(root, "src/app/globals.css"), "utf8");
  assert.match(css, /size: A4 landscape/);
  assert.match(css, /\.screen-only\s*\{\s*display: none !important/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /html\[data-theme="light"\]/);
  assert.doesNotMatch(css.slice(0, css.indexOf("@page")), /!important/);
});


test('lista oferece primeiro registro e exemplos opcionais; tabela e cartões mantêm edição e exclusão', () => {
  const props = { activities: [], totalHours: 0, editingId: null, onEdit: noop, onDelete: noop, user: sampleUser, monthLabel: 'Outubro/2026', onLoadSamples: noop, onClearMonth: noop };
  const empty = render(React.createElement(ActivityTable, props));
  assert.match(empty, /Registrar primeira atividade/);
  assert.match(empty, /Carregar exemplos do GAT/);
  const filled = render(React.createElement(ActivityTable, { ...props, activities: [sampleActivity], totalHours: 2 }));
  assert.match(filled, /<table/);
  assert.match(filled, /aria-label="Editar atividade"/);
  assert.match(filled, /aria-label="Excluir atividade"/);
  assert.match(filled, /Atividade de teste/);
});
