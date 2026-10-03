"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createOrganizationAction } from "@/lib/domain/admin-actions";
import {
  Building2,
  Plus,
  Search,
  Mail,
  Phone,
  Stethoscope,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import type {
  AdminOrganizationRow,
  AdminUserRow,
  AdminProfessionalRow,
} from "@/lib/domain/admin";

interface UsuariosViewProps {
  organizations: AdminOrganizationRow[];
  users: AdminUserRow[];
  professionals: AdminProfessionalRow[];
}

export function UsuariosView({
  organizations,
  users,
  professionals,
}: UsuariosViewProps) {
  const [activeTab, setActiveTab] = useState<"organizacoes" | "profissionais" | "usuarios">("organizacoes");
  const [search, setSearch] = useState("");
  const [showNewOrg, setShowNewOrg] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await createOrganizationAction(newOrgName.trim());
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Organização cadastrada com sucesso!");
        setNewOrgName("");
        setShowNewOrg(false);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro ao cadastrar organização.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredOrgs = organizations.filter((o) =>
    o.name.toLowerCase().includes(search.toLowerCase()),
  );

  const filteredPros = professionals.filter(
    (p) =>
      p.display_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.email?.toLowerCase().includes(search.toLowerCase()) ||
      p.crp.toLowerCase().includes(search.toLowerCase()) ||
      p.organization_name?.toLowerCase().includes(search.toLowerCase()),
  );

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.display_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Title & Top Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Usuários & Organizações
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Gerenciamento administrativo de clínicas parceiras, credenciamento de profissionais e perfis de acesso.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            onClick={() => setShowNewOrg(!showNewOrg)}
            className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs h-10 px-4"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Nova Organização
          </Button>
        </div>
      </div>

      {/* New Org Form Modal/Drawer */}
      {showNewOrg && (
        <Card className="border-amber-200 bg-amber-50/30 rounded-3xl p-5 sm:p-6 space-y-3 animate-in fade-in-50">
          <h2 className="text-xs font-bold uppercase tracking-wider text-amber-900">
            Cadastrar Nova Organização / Clínica
          </h2>
          <form onSubmit={handleCreateOrg} className="space-y-3">
            <div className="space-y-1">
              <label htmlFor="orgNameInput" className="text-xs font-medium text-slate-700">Nome da Instituição</label>
              <Input
                id="orgNameInput"
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
                placeholder="Ex: Instituto Integração Psicológica"
                required
                className="bg-white text-xs rounded-xl h-10"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowNewOrg(false)}
                className="rounded-xl text-xs"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !newOrgName.trim()}
                className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs px-4"
              >
                {isSubmitting ? "Cadastrando..." : "Confirmar Cadastro"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Controls: Search & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-2xl gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("organizacoes")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "organizacoes"
                ? "bg-white text-amber-800 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Organizações ({organizations.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("profissionais")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "profissionais"
                ? "bg-white text-amber-800 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Profissionais ({professionals.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("usuarios")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "usuarios"
                ? "bg-white text-amber-800 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Todos Usuários ({users.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filtrar registros..."
            className="pl-8 text-xs bg-white rounded-xl h-9"
          />
        </div>
      </div>

      {/* Tab 1: Organizações */}
      {activeTab === "organizacoes" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {filteredOrgs.length === 0 ? (
            <div className="col-span-full p-8 text-center text-xs text-slate-400">
              Nenhuma organização encontrada.
            </div>
          ) : (
            filteredOrgs.map((org) => (
              <Card key={org.id} className="border-slate-200 bg-white shadow-xs rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center font-bold shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{org.name}</h3>
                    <p className="text-[11px] text-slate-400">
                      Cadastrada em {new Date(org.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Status da Clínica</span>
                  <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
                    Ativa
                  </Badge>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Profissionais */}
      {activeTab === "profissionais" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {filteredPros.length === 0 ? (
            <div className="col-span-full p-8 text-center text-xs text-slate-400">
              Nenhum profissional encontrado.
            </div>
          ) : (
            filteredPros.map((pro) => (
              <Card key={pro.id} className="border-slate-200 bg-white shadow-xs rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center font-bold shrink-0">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{pro.display_name || "Terapeuta"}</h3>
                    <p className="text-[11px] text-slate-400">CRP: {pro.crp}</p>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{pro.organization_name || "Sem clínica vinculada"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{pro.email || "Sem e-mail"}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px] bg-indigo-50 text-indigo-700 border-indigo-200">
                    {pro.specialty || "Psicologia Clínica"}
                  </Badge>
                  <span className="text-[11px] text-slate-400">Credenciado</span>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Todos Usuários */}
      {activeTab === "usuarios" && (
        <Card className="border-slate-200 bg-white shadow-xs rounded-3xl overflow-hidden divide-y divide-slate-100">
          {filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Nenhum usuário encontrado.
            </div>
          ) : (
            filteredUsers.map((u) => {
              const roleColor =
                u.role === "admin"
                  ? "bg-amber-50 text-amber-800 border-amber-200"
                  : u.role === "professional"
                    ? "bg-indigo-50 text-indigo-800 border-indigo-200"
                    : "bg-emerald-50 text-emerald-800 border-emerald-200";

              return (
                <div key={u.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                      {u.display_name ? u.display_name.charAt(0).toUpperCase() : u.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{u.display_name || "Sem nome"}</span>
                        <Badge variant="outline" className={`text-[10px] uppercase font-semibold ${roleColor}`}>
                          {u.role}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {u.email}
                        </span>
                        {u.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {u.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center gap-1 self-start sm:self-auto">
                    <Calendar className="w-3 h-3" />
                    Criado em {new Date(u.created_at).toLocaleDateString("pt-BR")}
                  </div>
                </div>
              );
            })
          )}
        </Card>
      )}
    </div>
  );
}
