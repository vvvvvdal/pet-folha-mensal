'use client';

import React, { useState } from 'react';
import {
  UserProfile,
  GATInfo,
  ActivityTemplate,
  ModalityType
} from '@/types';
import {
  ADMIN_PASSWORD,
  saveGats,
  saveRoles,
  saveTemplates,
  updateRoleName,
  updateGatInfo,
  DEFAULT_TEMPLATES
} from '@/lib/storage';
import {
  Shield,
  X,
  Lock,
  Briefcase,
  Layers,
  CalendarDays,
  Plus,
  Trash2,
  Edit2,
  Check,
  AlertTriangle,
  LogOut,
  RotateCcw
} from 'lucide-react';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  profiles?: UserProfile[];
  gats: Record<string, GATInfo>;
  roles: string[];
  templates: ActivityTemplate[];
  onProfilesChange?: (updated: UserProfile[]) => void;
  onGatsChange: (updated: Record<string, GATInfo>) => void;
  onRolesChange: (updated: string[]) => void;
  onTemplatesChange: (updated: ActivityTemplate[]) => void;
  onSelectUser?: (user: UserProfile) => void;
  defaultAuthenticated?: boolean;
  defaultTab?: 'roles' | 'gats' | 'templates';
}

export function AdminModal({
  isOpen,
  onClose,
  profiles = [],
  gats,
  roles,
  templates,
  onProfilesChange,
  onGatsChange,
  onRolesChange,
  onTemplatesChange,
  onSelectUser,
  defaultAuthenticated = false,
  defaultTab = 'roles'
}: AdminModalProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (defaultAuthenticated) return true;
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('auth') === '1';
    }
    return false;
  });
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [activeTab, setActiveTab] = useState<'roles' | 'gats' | 'templates'>(() => {
    if (typeof window !== 'undefined') {
      const tab = new URLSearchParams(window.location.search).get('tab');
      if (tab === 'templates' || tab === 'roles' || tab === 'gats') return tab;
    }
    return defaultTab;
  });

  // Formulário de Edição / Nova Função (Role)
  const [newRoleName, setNewRoleName] = useState('');
  const [editingRoleOriginal, setEditingRoleOriginal] = useState<string | null>(null);
  const [editingRoleNewName, setEditingRoleNewName] = useState('');

  // Formulário de Edição / Novo GAT
  const [newGatNumber, setNewGatNumber] = useState('');
  const [newGatName, setNewGatName] = useState('');
  const [newGatAxis, setNewGatAxis] = useState('Eixo I');
  const [newGatDesc, setNewGatDesc] = useState('');
  const [editingGatOriginalNumber, setEditingGatOriginalNumber] = useState<string | null>(null);
  const [editingGat, setEditingGat] = useState<GATInfo | null>(null);

  // Formulário de Edição / Novo Template (Sem datas nem horários!)
  const [newTplName, setNewTplName] = useState('');
  const [newTplModality, setNewTplModality] = useState<ModalityType>('Síncrona virtual');
  const [newTplGatSpecific, setNewTplGatSpecific] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ActivityTemplate | null>(null);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setPinError(false);
      setPinInput('');
    } else {
      setPinError(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPinInput('');
    setPinError(false);
  };

  // ============================================================
  // AÇÕES: FUNÇÕES / TIPOS DE PESSOAS (ROLES) - COM EDIÇÃO
  // ============================================================

  const handleAddRole = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newRoleName.trim();
    if (!clean) return;
    if (roles.some((r) => r.toLowerCase() === clean.toLowerCase())) {
      alert('Esta função já está cadastrada.');
      return;
    }
    const updated = [...roles, clean];
    saveRoles(updated);
    onRolesChange(updated);
    setNewRoleName('');
  };

  const handleStartEditRole = (role: string) => {
    setEditingRoleOriginal(role);
    setEditingRoleNewName(role);
  };

  const handleSaveEditRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoleOriginal) return;
    const clean = editingRoleNewName.trim();
    if (!clean) return;

    if (
      clean.toLowerCase() !== editingRoleOriginal.toLowerCase() &&
      roles.some((r) => r.toLowerCase() === clean.toLowerCase())
    ) {
      alert('Já existe outra função com este nome.');
      return;
    }

    updateRoleName(editingRoleOriginal, clean);
    const updatedRoles = roles.map((r) => (r === editingRoleOriginal ? clean : r));
    onRolesChange(updatedRoles);

    // Atualiza usuários em tela
    const updatedProfiles = profiles.map((p) =>
      p.role === editingRoleOriginal ? { ...p, role: clean } : p
    );
    onProfilesChange?.(updatedProfiles);

    setEditingRoleOriginal(null);
    setEditingRoleNewName('');
  };

  const handleDeleteRole = (roleToDelete: string) => {
    if (confirm(`Excluir a função "${roleToDelete}"?`)) {
      const updated = roles.filter((r) => r !== roleToDelete);
      saveRoles(updated);
      onRolesChange?.(updated);
    }
  };

  // ============================================================
  // AÇÕES: GRUPOS TUTORIAIS (GATS) - COM EDIÇÃO
  // ============================================================

  const handleAddGat = (e: React.FormEvent) => {
    e.preventDefault();
    const num = newGatNumber.trim().padStart(2, '0');
    const name = newGatName.trim();
    if (!num || !name) return;

    if (gats[num]) {
      alert(`O GAT ${num} já existe.`);
      return;
    }

    const updated: Record<string, GATInfo> = {
      ...gats,
      [num]: {
        number: num,
        name,
        fullName: `GAT ${num} (${name})`,
        axis: newGatAxis.trim() || 'Eixo I',
        description: newGatDesc.trim() || `Grupo Tutorial ${num}`
      }
    };

    saveGats(updated);
    onGatsChange(updated);

    setNewGatNumber('');
    setNewGatName('');
    setNewGatDesc('');
  };

  const handleStartEditGat = (num: string, info: GATInfo) => {
    setEditingGatOriginalNumber(num);
    setEditingGat({ ...info });
  };

  const handleSaveEditGat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGatOriginalNumber || !editingGat) return;

    const num = editingGat.number.trim().padStart(2, '0');
    const name = editingGat.name.trim();
    if (!num || !name) return;

    // Se mudou o número e o novo número já existe em outro GAT
    if (num !== editingGatOriginalNumber && gats[num]) {
      alert(`O GAT ${num} já existe.`);
      return;
    }

    const finalGat: GATInfo = {
      ...editingGat,
      number: num,
      name,
      fullName: `GAT ${num} (${name})`
    };

    updateGatInfo(editingGatOriginalNumber, finalGat);

    const updatedGats = { ...gats };
    if (editingGatOriginalNumber !== num) {
      delete updatedGats[editingGatOriginalNumber];
    }
    updatedGats[num] = finalGat;
    onGatsChange(updatedGats);

    // Atualiza participantes em tela
    const updatedProfiles = profiles.map((p) => {
      if (p.gatNumber === editingGatOriginalNumber) {
        return {
          ...p,
          gatNumber: num,
          gatName: name
        };
      }
      return p;
    });
    onProfilesChange?.(updatedProfiles);

    setEditingGatOriginalNumber(null);
    setEditingGat(null);
  };

  const handleDeleteGat = (gatNum: string) => {
    if (confirm(`Excluir o GAT ${gatNum}?`)) {
      const updated = { ...gats };
      delete updated[gatNum];
      saveGats(updated);
      onGatsChange?.(updated);
    }
  };

  // ============================================================
  // AÇÕES: TEMPLATES DE ATIVIDADES (SEM DATAS/HORÁRIOS, COM EDIÇÃO)
  // ============================================================

  const handleAddTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newTplGatSpecific
      ? 'Reunião do GAT {gatNumber} ({gatName})'
      : newTplName.trim();

    if (!cleanName) return;

    const newTpl: ActivityTemplate = {
      id: `tpl-${Date.now().toString(36)}`,
      name: cleanName,
      modality: newTplModality,
      isGatSpecific: newTplGatSpecific
    };

    const updated = [...templates, newTpl];
    saveTemplates(updated);
    onTemplatesChange(updated);

    setNewTplName('');
    setNewTplGatSpecific(false);
  };

  const handleStartEditTemplate = (tpl: ActivityTemplate) => {
    setEditingTemplate({
      ...tpl,
      name: tpl.name || (tpl as any).descriptionTemplate || ''
    });
  };

  const handleSaveEditTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate) return;

    const cleanName = editingTemplate.isGatSpecific
      ? 'Reunião do GAT {gatNumber} ({gatName})'
      : editingTemplate.name.trim();

    if (!cleanName) return;

    const finalTpl: ActivityTemplate = {
      ...editingTemplate,
      name: cleanName
    };

    const updated = templates.map((t) => (t.id === editingTemplate.id ? finalTpl : t));
    saveTemplates(updated);
    onTemplatesChange(updated);
    setEditingTemplate(null);
  };

  const handleDeleteTemplate = (id: string, name?: string) => {
    if (!confirm(`Deseja realmente excluir o modelo de atividade "${name || 'selecionado'}"?`)) {
      return;
    }
    const updated = templates.filter((t) => t.id !== id);
    saveTemplates(updated);
    onTemplatesChange(updated);
  };

  const handleResetTemplates = () => {
    if (confirm('Deseja restaurar os templates padrão do Ministério da Saúde?')) {
      saveTemplates(DEFAULT_TEMPLATES);
      onTemplatesChange(DEFAULT_TEMPLATES);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-fade-in">
      <div
        className="w-full max-w-3xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2">
            <Shield className="size-4 text-[#10B981]" />
            <h3 className="text-sm font-semibold text-slate-100">Painel de Gestão & Administração</h3>
            {isAuthenticated && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#008D4C]/10 text-[#10B981] border border-[#008D4C]/20 font-medium">
                Admin Autenticado
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {isAuthenticated && (
              <button
                type="button"
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 text-xs flex items-center gap-1 cursor-pointer transition-colors"
                title="Sair do modo administrador"
              >
                <LogOut className="size-3.5" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        {!isAuthenticated ? (
          /* TELA DE AUTENTICAÇÃO COM PIN 4031 */
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-4">
            <div className="size-12 rounded-full bg-[#008D4C]/10 border border-[#008D4C]/20 flex items-center justify-center text-[#10B981]">
              <Lock className="size-5" />
            </div>
            <div>
              <h4 className="text-base font-semibold text-slate-100">Área de Acesso Restrito</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Digite o PIN de administrador para acessar o gerenciamento de participantes, templates, GATs e funções.
              </p>
            </div>

            <form onSubmit={handleLogin} className="w-full max-w-xs space-y-3 pt-2">
              <div>
                <input
                  type="password"
                  autoFocus
                  placeholder="PIN mestre (4031)"
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    if (pinError) setPinError(false);
                  }}
                  className={`w-full text-center px-4 py-2.5 text-sm tracking-widest font-mono rounded-lg bg-slate-950 border ${
                    pinError ? 'border-red-500 text-red-300' : 'border-slate-800 text-slate-100'
                  } outline-none focus:border-[#008D4C]`}
                />
                {pinError && (
                  <p className="text-[11px] text-red-400 mt-1.5 flex items-center justify-center gap-1">
                    <AlertTriangle className="size-3" />
                    PIN incorreto. Tente novamente.
                  </p>
                )}
              </div>
              <button
                type="submit"
                className="w-full py-2 text-xs font-semibold rounded-lg bg-[#008D4C] text-white hover:bg-[#10B981] transition-all cursor-pointer shadow-sm"
              >
                Acessar Painel
              </button>
            </form>
          </div>
        ) : (
          /* PAINEL COMPLETO COM ABAS */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Navegação de Abas */}
            <div className="flex border-b border-slate-800 bg-slate-950/60 text-xs font-medium px-4 overflow-x-auto">
              <button
                onClick={() => setActiveTab('roles')}
                className={`py-2.5 px-3 flex items-center gap-2 border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
                  activeTab === 'roles'
                    ? 'border-[#008D4C] text-[#10B981]'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Briefcase className="size-3.5" />
                <span>Tipos / Funções ({roles.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('gats')}
                className={`py-2.5 px-3 flex items-center gap-2 border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
                  activeTab === 'gats'
                    ? 'border-[#008D4C] text-[#10B981]'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="size-3.5" />
                <span>Grupos Tutoriais ({Object.keys(gats).length})</span>
              </button>
              <button
                onClick={() => setActiveTab('templates')}
                className={`py-2.5 px-3 flex items-center gap-2 border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
                  activeTab === 'templates'
                    ? 'border-[#008D4C] text-[#10B981]'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <CalendarDays className="size-3.5" />
                <span>Templates de Atividades ({templates.length})</span>
              </button>
            </div>

            {/* Conteúdo da Aba Ativa */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
              {/* ============================================================
                  ABA 1: FUNÇÕES / TIPOS DE PESSOAS (ROLES) - COM EDIÇÃO
                  ============================================================ */}
              {activeTab === 'roles' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      Configure os tipos de participantes e vínculos permitidos no projeto (SUS/UFG).
                    </span>
                  </div>

                  <form onSubmit={handleAddRole} className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Ex: Pesquisador, Bolsista de Extensão, Coordenador de Eixo..."
                      value={newRoleName}
                      onChange={(e) => setNewRoleName(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-100 outline-none focus:border-[#008D4C]"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#008D4C] text-white hover:bg-[#10B981] cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="size-3.5" />
                      <span>Adicionar Função</span>
                    </button>
                  </form>

                  {/* Lista de Funções com Edição */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                    {roles.map((r) => {
                      const isEditing = editingRoleOriginal === r;

                      if (isEditing) {
                        return (
                          <form
                            key={r}
                            onSubmit={handleSaveEditRole}
                            className="p-2.5 rounded-lg border border-[#008D4C]/40 bg-[#00341f]/20 flex items-center gap-2"
                          >
                            <input
                              type="text"
                              required
                              autoFocus
                              value={editingRoleNewName}
                              onChange={(e) => setEditingRoleNewName(e.target.value)}
                              className="flex-1 px-2 py-1 text-xs rounded bg-slate-900 border border-slate-700 text-slate-100 outline-none focus:border-[#008D4C]"
                            />
                            <button
                              type="submit"
                              className="p-1.5 rounded bg-[#008D4C] text-white hover:bg-[#10B981] cursor-pointer"
                              title="Salvar alteração"
                            >
                              <Check className="size-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingRoleOriginal(null)}
                              className="p-1.5 rounded text-slate-400 hover:bg-slate-800 cursor-pointer"
                              title="Cancelar"
                            >
                              <X className="size-3.5" />
                            </button>
                          </form>
                        );
                      }

                      return (
                        <div
                          key={r}
                          className="p-3 rounded-lg border border-slate-800 bg-slate-950/40 flex items-center justify-between text-xs hover:border-slate-700 transition-colors"
                        >
                          <div>
                            <div className="font-semibold text-slate-200">{r}</div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleStartEditRole(r)}
                              className="p-1 rounded text-slate-400 hover:text-[#10B981] hover:bg-slate-800 cursor-pointer transition-colors"
                              title="Editar nome da função"
                            >
                              <Edit2 className="size-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteRole(r)}
                              className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-slate-800 cursor-pointer transition-colors"
                              title="Excluir função"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ============================================================
                  ABA 3: GRUPOS TUTORIAIS (GATS) - COM EDIÇÃO
                  ============================================================ */}
              {activeTab === 'gats' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      Cadastre novos GATs ou ajuste a estrutura temática territorial.
                    </span>
                  </div>

                  {/* Edição de GAT Selecionado */}
                  {editingGat && (
                    <form onSubmit={handleSaveEditGat} className="p-4 rounded-xl border border-[#008D4C]/40 bg-[#00341f]/20 space-y-3 text-xs animate-fade-in">
                      <div className="font-semibold text-[#10B981]">
                        Editando GAT {editingGatOriginalNumber}: {editingGat.name}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Número</label>
                          <input
                            type="text"
                            required
                            value={editingGat.number}
                            onChange={(e) => setEditingGat({ ...editingGat, number: e.target.value })}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 outline-none focus:border-[#008D4C]"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Nome / Bioma</label>
                          <input
                            type="text"
                            required
                            value={editingGat.name}
                            onChange={(e) => setEditingGat({ ...editingGat, name: e.target.value })}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 outline-none focus:border-[#008D4C]"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Eixo Temático</label>
                          <select
                            value={editingGat.axis}
                            onChange={(e) => setEditingGat({ ...editingGat, axis: e.target.value })}
                            className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 outline-none focus:border-[#008D4C] cursor-pointer"
                          >
                            <option value="Eixo I">Eixo I (Atenção Primária e SAN)</option>
                            <option value="Eixo II">Eixo II (Atenção Especializada)</option>
                            <option value="Eixo III">Eixo III (Comunicação e IA Preditiva)</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Descrição do Território / Foco</label>
                        <input
                          type="text"
                          value={editingGat.description}
                          onChange={(e) => setEditingGat({ ...editingGat, description: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 outline-none focus:border-[#008D4C]"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingGatOriginalNumber(null);
                            setEditingGat(null);
                          }}
                          className="px-3 py-1.5 rounded-lg text-slate-400 hover:bg-slate-800 cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="px-3.5 py-1.5 font-semibold rounded-lg bg-[#008D4C] text-white hover:bg-[#10B981] cursor-pointer"
                        >
                          Salvar GAT
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Adicionar Novo GAT */}
                  <form onSubmit={handleAddGat} className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-3 text-xs">
                    <div className="font-semibold text-slate-200">Adicionar Novo GAT</div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Número (ex: 06)</label>
                        <input
                          type="text"
                          required
                          placeholder="06"
                          value={newGatNumber}
                          onChange={(e) => setNewGatNumber(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 outline-none focus:border-[#008D4C]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Nome / Bioma (ex: Guariroba)</label>
                        <input
                          type="text"
                          required
                          placeholder="Nome do fruto/árvore..."
                          value={newGatName}
                          onChange={(e) => setNewGatName(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 outline-none focus:border-[#008D4C]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Eixo Temático</label>
                        <select
                          value={newGatAxis}
                          onChange={(e) => setNewGatAxis(e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 outline-none focus:border-[#008D4C] cursor-pointer"
                        >
                          <option value="Eixo I">Eixo I (Atenção Primária e SAN)</option>
                          <option value="Eixo II">Eixo II (Atenção Especializada)</option>
                          <option value="Eixo III">Eixo III (Comunicação e IA Preditiva)</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Descrição do Território / Foco</label>
                      <input
                        type="text"
                        placeholder="Ex: Vigilância de arboviroses na Região Norte..."
                        value={newGatDesc}
                        onChange={(e) => setNewGatDesc(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 outline-none focus:border-[#008D4C]"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-3.5 py-1.5 font-semibold rounded-lg bg-[#008D4C] text-white hover:bg-[#10B981] cursor-pointer flex items-center gap-1.5"
                      >
                        <Plus className="size-3.5" />
                        <span>Adicionar GAT</span>
                      </button>
                    </div>
                  </form>

                  {/* Cards de GATs Atuais com Edição */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {Object.entries(gats).map(([num, info]) => {
                      return (
                        <div
                          key={num}
                          className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/40 text-xs flex flex-col justify-between hover:border-slate-700 transition-colors"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="font-semibold text-[#10B981]">
                                GAT {num} — {info.name}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                                {info.axis}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                              {info.description}
                            </p>
                          </div>
                          <div className="flex items-center justify-end pt-2 border-t border-slate-800/80">
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleStartEditGat(num, info)}
                                className="p-1 rounded text-slate-400 hover:text-[#10B981] hover:bg-slate-800 cursor-pointer transition-colors"
                                title="Editar GAT"
                              >
                                <Edit2 className="size-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteGat(num)}
                                className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-slate-800 cursor-pointer transition-colors"
                                title="Excluir GAT"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ============================================================
                  ABA 4: TEMPLATES DE ATIVIDADES (SEM DATAS NEM HORÁRIOS)
                  ============================================================ */}
              {activeTab === 'templates' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      Configure os modelos de atividades (nomes e modalidades) usados para preenchimento rápido.
                    </span>
                    <button
                      type="button"
                      onClick={handleResetTemplates}
                      className="px-2.5 py-1 rounded-lg border border-slate-800 text-slate-400 hover:text-slate-200 text-xs flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <RotateCcw className="size-3" />
                      <span>Restaurar Padrão</span>
                    </button>
                  </div>

                  {/* Edição de Template */}
                  {editingTemplate && (
                    <form onSubmit={handleSaveEditTemplate} className="p-4 rounded-xl border border-[#008D4C]/40 bg-[#00341f]/20 space-y-3 text-xs animate-fade-in">
                      <div className="font-semibold text-[#10B981]">Editando Modelo de Atividade</div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] text-slate-400 mb-1">Nome / Descrição da Atividade</label>
                          <input
                            type="text"
                            required
                            disabled={editingTemplate.isGatSpecific}
                            value={editingTemplate.isGatSpecific ? 'Reunião do GAT {gatNumber} ({gatName})' : editingTemplate.name}
                            onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 outline-none focus:border-[#008D4C] disabled:opacity-50"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Modalidade</label>
                          <select
                            value={editingTemplate.modality}
                            onChange={(e) => setEditingTemplate({ ...editingTemplate, modality: e.target.value as ModalityType })}
                            className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 outline-none focus:border-[#008D4C] cursor-pointer"
                          >
                            <option value="Síncrona virtual">Síncrona virtual</option>
                            <option value="Síncrona presencial">Síncrona presencial</option>
                            <option value="Assíncrona virtual">Assíncrona virtual</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-1">
                        <label className="flex items-center gap-1.5 text-[11px] text-slate-400 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editingTemplate.isGatSpecific || false}
                            onChange={(e) => setEditingTemplate({ ...editingTemplate, isGatSpecific: e.target.checked })}
                            className="rounded accent-[#008D4C]"
                          />
                          <span>Atividade própria do GAT (dinâmica)</span>
                        </label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingTemplate(null)}
                            className="px-3 py-1.5 rounded-lg text-slate-400 hover:bg-slate-800 cursor-pointer"
                          >
                            Cancelar
                          </button>
                          <button
                            type="submit"
                            className="px-3.5 py-1.5 font-semibold rounded-lg bg-[#008D4C] text-white hover:bg-[#10B981] cursor-pointer"
                          >
                            Salvar Modelo
                          </button>
                        </div>
                      </div>
                    </form>
                  )}

                  {/* Adicionar Novo Template (Sem Dia, Sem Entrada, Sem Saída) */}
                  <form onSubmit={handleAddTemplate} className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-3 text-xs">
                    <div className="font-semibold text-slate-200">Adicionar Novo Modelo de Atividade</div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] text-slate-400 mb-1">Nome da Atividade</label>
                        <input
                          type="text"
                          required={!newTplGatSpecific}
                          disabled={newTplGatSpecific}
                          placeholder={newTplGatSpecific ? 'Reunião do GAT (automática)' : 'Ex: Oficina de Indicadores SISVAN, Seminário...'}
                          value={newTplGatSpecific ? 'Reunião do GAT {gatNumber} ({gatName})' : newTplName}
                          onChange={(e) => setNewTplName(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 outline-none focus:border-[#008D4C] disabled:opacity-50"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Modalidade</label>
                        <select
                          value={newTplModality}
                          onChange={(e) => setNewTplModality(e.target.value as ModalityType)}
                          className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 outline-none focus:border-[#008D4C] cursor-pointer"
                        >
                          <option value="Síncrona virtual">Síncrona virtual</option>
                          <option value="Síncrona presencial">Síncrona presencial</option>
                          <option value="Assíncrona virtual">Assíncrona virtual</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center gap-1.5 text-[11px] text-slate-400 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newTplGatSpecific}
                          onChange={(e) => setNewTplGatSpecific(e.target.checked)}
                          className="rounded accent-[#008D4C]"
                        />
                        <span>Atividade própria do GAT (injeta número e nome automaticamente)</span>
                      </label>

                      <button
                        type="submit"
                        className="px-3.5 py-1.5 font-semibold rounded-lg bg-[#008D4C] text-white hover:bg-[#10B981] cursor-pointer flex items-center gap-1.5"
                      >
                        <Plus className="size-3.5" />
                        <span>Adicionar Modelo</span>
                      </button>
                    </div>
                  </form>

                  {/* Lista de Modelos de Atividades com Edição e Exclusão */}
                  <div className="space-y-2">
                    {templates.map((tpl, i) => (
                      <div
                        key={tpl.id || i}
                        className="p-3 rounded-lg border border-slate-800 bg-slate-950/40 text-xs flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                      >
                        <div>
                          <div className="font-medium text-slate-200">
                            {tpl.name || (tpl as any).descriptionTemplate || 'Modelo'}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            Tipo: <span className="text-[#10B981] font-medium">{tpl.modality}</span>
                            {tpl.isGatSpecific && <span className="ml-2 text-[#00A3E0] font-medium">• GAT Dinâmico</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleStartEditTemplate(tpl)}
                            className="p-1 rounded text-slate-400 hover:text-[#10B981] hover:bg-slate-800 cursor-pointer transition-colors"
                            title="Editar modelo"
                          >
                            <Edit2 className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTemplate(tpl.id, tpl.name)}
                            className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-slate-800 cursor-pointer transition-colors"
                            title="Excluir modelo"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
