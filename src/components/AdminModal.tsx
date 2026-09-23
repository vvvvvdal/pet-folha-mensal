'use client';

import React, { useState } from 'react';
import {
  UserProfile,
  UserRole,
  GATInfo,
  ActivityTemplate,
  ModalityType
} from '@/types';
import {
  ADMIN_PASSWORD,
  normalizeName,
  deduplicateProfiles,
  saveProfiles,
  deleteUserProfile,
  updateUserProfileAdmin,
  saveGats,
  saveRoles,
  saveTemplates,
  DEFAULT_TEMPLATES
} from '@/lib/storage';
import {
  Shield,
  X,
  Lock,
  Users,
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
  profiles: UserProfile[];
  gats: Record<string, GATInfo>;
  roles: string[];
  templates: ActivityTemplate[];
  onProfilesChange: (updated: UserProfile[]) => void;
  onGatsChange: (updated: Record<string, GATInfo>) => void;
  onRolesChange: (updated: string[]) => void;
  onTemplatesChange: (updated: ActivityTemplate[]) => void;
  onSelectUser: (user: UserProfile) => void;
}

export function AdminModal({
  isOpen,
  onClose,
  profiles,
  gats,
  roles,
  templates,
  onProfilesChange,
  onGatsChange,
  onRolesChange,
  onTemplatesChange,
  onSelectUser
}: AdminModalProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'gats' | 'templates'>('users');

  // Formulário de Edição de Usuário
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  // Formulário de Novo Usuário
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState(roles[0] || 'Estudante');
  const [newUserGat, setNewUserGat] = useState(Object.keys(gats)[0] || '01');

  // Formulário de Nova Função (Role)
  const [newRoleName, setNewRoleName] = useState('');

  // Formulário de Novo GAT
  const [newGatNumber, setNewGatNumber] = useState('');
  const [newGatName, setNewGatName] = useState('');
  const [newGatAxis, setNewGatAxis] = useState('Eixo I');
  const [newGatDesc, setNewGatDesc] = useState('');

  // Formulário de Novo Template
  const [newTplDay, setNewTplDay] = useState(15);
  const [newTplStart, setNewTplStart] = useState('19:00');
  const [newTplEnd, setNewTplEnd] = useState('21:00');
  const [newTplModality, setNewTplModality] = useState<ModalityType>('Síncrona virtual');
  const [newTplDesc, setNewTplDesc] = useState('');
  const [newTplGatSpecific, setNewTplGatSpecific] = useState(false);

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
  // AÇÕES: USUÁRIOS
  // ============================================================

  const hasDuplicateUsers = () => {
    const names = profiles.map((p) => normalizeName(p.name));
    return new Set(names).size !== names.length;
  };

  const handleDeduplicate = () => {
    const clean = deduplicateProfiles(profiles);
    saveProfiles(clean);
    onProfilesChange(clean);
    alert('Perfis duplicados mesclados e removidos com sucesso.');
  };

  const handleSaveEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    const res = updateUserProfileAdmin(editingUser);
    if (!res.success) {
      alert(res.error);
      return;
    }
    const updated = profiles.map((p) => (p.id === editingUser.id ? editingUser : p));
    onProfilesChange(updated);
    setEditingUser(null);
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim()) return;

    const normalized = normalizeName(newUserName);
    if (profiles.some((p) => normalizeName(p.name) === normalized)) {
      alert(`Já existe um participante com o nome "${newUserName.trim()}".`);
      return;
    }

    const gatInfo = gats[newUserGat];
    const newUser: UserProfile = {
      id: `usr-${Date.now().toString(36)}`,
      name: newUserName.trim(),
      email: newUserEmail.trim() || undefined,
      role: newUserRole,
      gatNumber: newUserGat,
      gatName: gatInfo?.name || `GAT ${newUserGat}`,
      createdAt: new Date().toISOString()
    };

    const updated = [...profiles, newUser];
    saveProfiles(updated);
    onProfilesChange(updated);

    setNewUserName('');
    setNewUserEmail('');
    setIsAddingUser(false);
  };

  const handleDeleteUser = (id: string, name: string) => {
    if (confirm(`Deseja realmente excluir o participante "${name}"?`)) {
      deleteUserProfile(id);
      const updated = profiles.filter((p) => p.id !== id);
      onProfilesChange(updated);
    }
  };

  // ============================================================
  // AÇÕES: FUNÇÕES (ROLES)
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

  const handleDeleteRole = (roleToDelete: string) => {
    const isUsed = profiles.some((p) => p.role === roleToDelete);
    if (isUsed) {
      alert(`Não é possível excluir a função "${roleToDelete}" porque existem participantes cadastrados com ela.`);
      return;
    }
    if (confirm(`Excluir a função "${roleToDelete}"?`)) {
      const updated = roles.filter((r) => r !== roleToDelete);
      saveRoles(updated);
      onRolesChange(updated);
    }
  };

  // ============================================================
  // AÇÕES: GATS
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

  const handleDeleteGat = (gatNum: string) => {
    const isUsed = profiles.some((p) => p.gatNumber === gatNum);
    if (isUsed) {
      alert(`Não é possível excluir o GAT ${gatNum} porque há participantes vinculados a ele.`);
      return;
    }
    if (confirm(`Excluir o GAT ${gatNum}?`)) {
      const updated = { ...gats };
      delete updated[gatNum];
      saveGats(updated);
      onGatsChange(updated);
    }
  };

  // ============================================================
  // AÇÕES: TEMPLATES DE ATIVIDADES
  // ============================================================

  const handleAddTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTplDesc.trim()) return;

    const newTpl: ActivityTemplate = {
      id: `tpl-${Date.now().toString(36)}`,
      day: Number(newTplDay),
      start: newTplStart,
      end: newTplEnd,
      modality: newTplModality,
      descriptionTemplate: newTplGatSpecific ? `{gatLabel} (${newTplModality})` : newTplDesc.trim(),
      isGatSpecific: newTplGatSpecific
    };

    const updated = [...templates, newTpl];
    saveTemplates(updated);
    onTemplatesChange(updated);

    setNewTplDesc('');
    setNewTplGatSpecific(false);
  };

  const handleDeleteTemplate = (id: string) => {
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
            <Shield className="size-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-slate-100">Painel de Gestão & Administração</h3>
            {isAuthenticated && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
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
            <div className="size-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
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
                  } outline-none focus:border-emerald-500`}
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
                className="w-full py-2 text-xs font-semibold rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all cursor-pointer shadow-sm"
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
                onClick={() => setActiveTab('users')}
                className={`py-2.5 px-3 flex items-center gap-2 border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
                  activeTab === 'users'
                    ? 'border-emerald-500 text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Users className="size-3.5" />
                <span>Participantes ({profiles.length})</span>
                {hasDuplicateUsers() && (
                  <span className="size-2 rounded-full bg-amber-400 animate-pulse" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('roles')}
                className={`py-2.5 px-3 flex items-center gap-2 border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
                  activeTab === 'roles'
                    ? 'border-emerald-500 text-emerald-400'
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
                    ? 'border-emerald-500 text-emerald-400'
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
                    ? 'border-emerald-500 text-emerald-400'
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
                  ABA 1: PARTICIPANTES
                  ============================================================ */}
              {activeTab === 'users' && (
                <div className="space-y-4">
                  {/* Alerta de Duplicidade */}
                  {hasDuplicateUsers() && (
                    <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 flex items-center justify-between gap-3 text-xs text-amber-300">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="size-4 shrink-0 text-amber-400" />
                        <span>Detectamos nomes duplicados na lista de participantes.</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleDeduplicate}
                        className="px-3 py-1 rounded-lg bg-amber-500 text-slate-950 font-semibold hover:bg-amber-400 cursor-pointer transition-all"
                      >
                        Mesclar e Limpar Duplicados
                      </button>
                    </div>
                  )}

                  {/* Toolbar */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-slate-400 font-medium">
                      Gerencie e edite os participantes cadastrados no sistema.
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsAddingUser(!isAddingUser)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 text-slate-950 hover:bg-emerald-400 cursor-pointer flex items-center gap-1.5 transition-all"
                    >
                      <Plus className="size-3.5" />
                      <span>{isAddingUser ? 'Fechar Formulário' : 'Novo Participante'}</span>
                    </button>
                  </div>

                  {/* Formulário: Novo Participante */}
                  {isAddingUser && (
                    <form onSubmit={handleAddUser} className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-3 text-xs animate-fade-in">
                      <div className="font-semibold text-slate-200">Cadastrar Novo Participante</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Nome Completo</label>
                          <input
                            type="text"
                            required
                            placeholder="Ex: João da Silva..."
                            value={newUserName}
                            onChange={(e) => setNewUserName(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">E-mail (opcional)</label>
                          <input
                            type="email"
                            placeholder="exemplo@discente.ufg.br"
                            value={newUserEmail}
                            onChange={(e) => setNewUserEmail(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Função</label>
                          <select
                            value={newUserRole}
                            onChange={(e) => setNewUserRole(e.target.value)}
                            className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 outline-none focus:border-emerald-500 cursor-pointer"
                          >
                            {roles.map((r) => (
                              <option key={r} value={r}>{r}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">GAT</label>
                          <select
                            value={newUserGat}
                            onChange={(e) => setNewUserGat(e.target.value)}
                            className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 outline-none focus:border-emerald-500 cursor-pointer"
                          >
                            {Object.entries(gats).map(([num, info]) => (
                              <option key={num} value={num}>GAT {num} ({info.name})</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setIsAddingUser(false)}
                          className="px-3 py-1.5 rounded-lg text-slate-400 hover:bg-slate-800 cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="px-3.5 py-1.5 rounded-lg font-semibold bg-emerald-500 text-slate-950 hover:bg-emerald-400 cursor-pointer"
                        >
                          Cadastrar
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Formulário: Edição de Participante */}
                  {editingUser && (
                    <form onSubmit={handleSaveEditUser} className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/10 space-y-3 text-xs animate-fade-in">
                      <div className="font-semibold text-emerald-300">Editando Participante: {editingUser.name}</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Nome Completo</label>
                          <input
                            type="text"
                            required
                            value={editingUser.name}
                            onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">E-mail</label>
                          <input
                            type="email"
                            value={editingUser.email || ''}
                            onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Função</label>
                          <select
                            value={editingUser.role}
                            onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                            className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 outline-none focus:border-emerald-500 cursor-pointer"
                          >
                            {roles.map((r) => (
                              <option key={r} value={r}>{r}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">GAT</label>
                          <select
                            value={editingUser.gatNumber}
                            onChange={(e) => {
                              const num = e.target.value;
                              const gatInfo = gats[num];
                              setEditingUser({
                                ...editingUser,
                                gatNumber: num,
                                gatName: gatInfo?.name || `GAT ${num}`
                              });
                            }}
                            className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 outline-none focus:border-emerald-500 cursor-pointer"
                          >
                            {Object.entries(gats).map(([num, info]) => (
                              <option key={num} value={num}>GAT {num} ({info.name})</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setEditingUser(null)}
                          className="px-3 py-1.5 rounded-lg text-slate-400 hover:bg-slate-800 cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="px-3.5 py-1.5 rounded-lg font-semibold bg-emerald-500 text-slate-950 hover:bg-emerald-400 cursor-pointer"
                        >
                          Salvar Alterações
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Tabela de Participantes */}
                  <div className="rounded-xl border border-slate-800 bg-slate-950/40 overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                          <th className="py-2.5 px-3">Nome</th>
                          <th className="py-2.5 px-3">Função</th>
                          <th className="py-2.5 px-3">GAT</th>
                          <th className="py-2.5 px-3 text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {profiles.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                            <td className="py-2.5 px-3 font-medium text-slate-200">
                              <div>{p.name}</div>
                              {p.email && <div className="text-[10px] text-slate-500">{p.email}</div>}
                            </td>
                            <td className="py-2.5 px-3 text-slate-300">{p.role}</td>
                            <td className="py-2.5 px-3 text-slate-300">
                              GAT {p.gatNumber} <span className="text-slate-500 text-[11px]">({p.gatName || gats[p.gatNumber]?.name})</span>
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    onSelectUser(p);
                                    onClose();
                                  }}
                                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 cursor-pointer"
                                  title="Ativar e abrir a folha deste participante"
                                >
                                  Ver Folha
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingUser(p)}
                                  className="p-1 rounded text-slate-400 hover:text-emerald-400 hover:bg-slate-800 cursor-pointer transition-colors"
                                  title="Editar dados"
                                >
                                  <Edit2 className="size-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteUser(p.id, p.name)}
                                  className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-slate-800 cursor-pointer transition-colors"
                                  title="Excluir participante"
                                >
                                  <Trash2 className="size-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ============================================================
                  ABA 2: FUNÇÕES / TIPOS DE PESSOAS (ROLES)
                  ============================================================ */}
              {activeTab === 'roles' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      Configure os tipos de participantes e vínculos permitidos no projeto (SUS/UFG).
                    </span>
                  </div>

                  {/* Adicionar Nova Função */}
                  <form onSubmit={handleAddRole} className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Ex: Pesquisador, Bolsista de Extensão, Coordenador de Eixo..."
                      value={newRoleName}
                      onChange={(e) => setNewRoleName(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-100 outline-none focus:border-emerald-500"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="size-3.5" />
                      <span>Adicionar Função</span>
                    </button>
                  </form>

                  {/* Lista de Funções */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                    {roles.map((r) => {
                      const count = profiles.filter((p) => p.role === r).length;
                      return (
                        <div
                          key={r}
                          className="p-3 rounded-lg border border-slate-800 bg-slate-950/40 flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="font-semibold text-slate-200">{r}</div>
                            <div className="text-[11px] text-slate-500">{count} {count === 1 ? 'participante' : 'participantes'}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteRole(r)}
                            disabled={count > 0}
                            className={`p-1 rounded cursor-pointer transition-colors ${
                              count > 0
                                ? 'text-slate-600 cursor-not-allowed'
                                : 'text-slate-400 hover:text-red-400 hover:bg-slate-800'
                            }`}
                            title={count > 0 ? 'Não é possível excluir função em uso' : 'Excluir função'}
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ============================================================
                  ABA 3: GRUPOS TUTORIAIS (GATS)
                  ============================================================ */}
              {activeTab === 'gats' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      Cadastre novos GATs ou ajuste a estrutura temática territorial.
                    </span>
                  </div>

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
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 outline-none focus:border-emerald-500"
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
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Eixo Temático</label>
                        <select
                          value={newGatAxis}
                          onChange={(e) => setNewGatAxis(e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 outline-none focus:border-emerald-500 cursor-pointer"
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
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-3.5 py-1.5 font-semibold rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 cursor-pointer flex items-center gap-1.5"
                      >
                        <Plus className="size-3.5" />
                        <span>Adicionar GAT</span>
                      </button>
                    </div>
                  </form>

                  {/* Cards de GATs Atuais */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {Object.entries(gats).map(([num, info]) => {
                      const count = profiles.filter((p) => p.gatNumber === num).length;
                      return (
                        <div
                          key={num}
                          className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/40 text-xs flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="font-semibold text-emerald-400">
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
                          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-500">
                            <span>{count} {count === 1 ? 'participante' : 'participantes'}</span>
                            <button
                              type="button"
                              onClick={() => handleDeleteGat(num)}
                              disabled={count > 0}
                              className={`p-1 rounded cursor-pointer transition-colors ${
                                count > 0
                                  ? 'text-slate-600 cursor-not-allowed'
                                  : 'text-slate-400 hover:text-red-400 hover:bg-slate-800'
                              }`}
                              title={count > 0 ? 'Não é possível excluir GAT com participantes ativos' : 'Excluir GAT'}
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
                  ABA 4: TEMPLATES DE ATIVIDADES
                  ============================================================ */}
              {activeTab === 'templates' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      Configure as atividades-padrão que são carregadas ao clicar em &quot;Carregar Atividades de Exemplo&quot;.
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

                  {/* Adicionar Novo Template */}
                  <form onSubmit={handleAddTemplate} className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-3 text-xs">
                    <div className="font-semibold text-slate-200">Adicionar Atividade ao Template</div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Dia do Mês</label>
                        <input
                          type="number"
                          min={1}
                          max={31}
                          required
                          value={newTplDay}
                          onChange={(e) => setNewTplDay(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Entrada</label>
                        <input
                          type="time"
                          required
                          value={newTplStart}
                          onChange={(e) => setNewTplStart(e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Saída</label>
                        <input
                          type="time"
                          required
                          value={newTplEnd}
                          onChange={(e) => setNewTplEnd(e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Modalidade</label>
                        <select
                          value={newTplModality}
                          onChange={(e) => setNewTplModality(e.target.value as ModalityType)}
                          className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 outline-none focus:border-emerald-500 cursor-pointer"
                        >
                          <option value="Síncrona virtual">Síncrona virtual</option>
                          <option value="Síncrona presencial">Síncrona presencial</option>
                          <option value="Assíncrona virtual">Assíncrona virtual</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] text-slate-400">Descrição da Atividade</label>
                        <label className="flex items-center gap-1.5 text-[11px] text-slate-400 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newTplGatSpecific}
                            onChange={(e) => setNewTplGatSpecific(e.target.checked)}
                            className="rounded accent-emerald-500"
                          />
                          <span>Atividade própria do GAT (injeta nome/número automaticamente)</span>
                        </label>
                      </div>
                      <input
                        type="text"
                        disabled={newTplGatSpecific}
                        placeholder={newTplGatSpecific ? 'Reunião do GAT (automática)' : 'Ex: Oficina formativa, Palestra climática...'}
                        value={newTplGatSpecific ? '{gatLabel} (Síncrona virtual)' : newTplDesc}
                        onChange={(e) => setNewTplDesc(e.target.value)}
                        required={!newTplGatSpecific}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 outline-none focus:border-emerald-500 disabled:opacity-50"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-3.5 py-1.5 font-semibold rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 cursor-pointer flex items-center gap-1.5"
                      >
                        <Plus className="size-3.5" />
                        <span>Adicionar ao Template</span>
                      </button>
                    </div>
                  </form>

                  {/* Lista de Atividades do Template */}
                  <div className="space-y-2">
                    {templates.map((tpl, i) => (
                      <div
                        key={tpl.id || i}
                        className="p-3 rounded-lg border border-slate-800 bg-slate-950/40 text-xs flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-emerald-400 font-semibold w-12 text-center py-1 rounded bg-slate-900 border border-slate-800">
                            Dia {tpl.day}
                          </span>
                          <div>
                            <div className="font-medium text-slate-200">{tpl.descriptionTemplate}</div>
                            <div className="text-[11px] text-slate-400">
                              {tpl.start} às {tpl.end} • {tpl.modality}
                              {tpl.isGatSpecific && <span className="ml-2 text-emerald-400 font-medium">(GAT dinâmico)</span>}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteTemplate(tpl.id)}
                          className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-slate-800 cursor-pointer transition-colors"
                          title="Excluir este template"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
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
