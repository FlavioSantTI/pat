"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  createSupportTicketAction,
  updateTicketStatusAction,
} from "@/lib/domain/admin-actions";
import {
  Plus,
  Clock,
  Lock,
  Mail,
} from "lucide-react";
import { toast } from "sonner";
import type { AdminSupportTicketRow, AdminAuditLogRow } from "@/lib/domain/admin";

interface SuporteViewProps {
  tickets: AdminSupportTicketRow[];
  auditLogs: AdminAuditLogRow[];
}

export function SuporteView({ tickets, auditLogs }: SuporteViewProps) {
  const [activeTab, setActiveTab] = useState<"chamados" | "logs">("chamados");
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatingTicketId, setUpdatingTicketId] = useState<string | null>(null);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await createSupportTicketAction(newSubject.trim());
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Chamado de suporte registrado!");
        setNewSubject("");
        setShowNewTicket(false);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro ao abrir chamado.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (
    ticketId: string,
    newStatus: "open" | "in_progress" | "resolved" | "closed",
  ) => {
    setUpdatingTicketId(ticketId);
    try {
      const res = await updateTicketStatusAction(ticketId, newStatus);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Status do chamado atualizado!");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro ao alterar status.");
    } finally {
      setUpdatingTicketId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Suporte Técnico & Logs de Auditoria
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Resolução de chamados operacionais e trilha imutável de eventos de auditoria do sistema.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            onClick={() => setShowNewTicket(!showNewTicket)}
            className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs h-10 px-4"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Abrir Chamado
          </Button>
        </div>
      </div>

      {/* Zero Therapeutic Leak Guarantee */}
      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3 text-xs text-amber-900">
        <Lock className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
        <div className="space-y-0.5">
          <span className="font-bold block">Garantia Técnica de Privacidade Clínica</span>
          <p className="text-amber-800 leading-relaxed text-[11px]">
            Os logs do sistema registram exclusivamente eventos de infraestrutura, autenticação e alterações de conta. Dados terapêuticos (D/P/A, notas profissionais, sessões e evoluções) não trafegam e não são armazenados nos registros de auditoria da administração.
          </p>
        </div>
      </div>

      {/* New Ticket Form */}
      {showNewTicket && (
        <Card className="border-amber-200 bg-amber-50/30 rounded-3xl p-5 sm:p-6 space-y-3 animate-in fade-in-50">
          <h2 className="text-xs font-bold uppercase tracking-wider text-amber-900">
            Registrar Chamado Operacional / Suporte
          </h2>
          <form onSubmit={handleCreateTicket} className="space-y-3">
            <div className="space-y-1">
              <label htmlFor="ticketSubjectInput" className="text-xs font-medium text-slate-700">Assunto ou Descrição do Incidente</label>
              <Input
                id="ticketSubjectInput"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder="Ex: Falha no envio de convite por e-mail para terapeuta"
                required
                className="bg-white text-xs rounded-xl h-10"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowNewTicket(false)}
                className="rounded-xl text-xs"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !newSubject.trim()}
                className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs px-4"
              >
                {isSubmitting ? "Registrando..." : "Confirmar Abertura"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Tabs Switcher */}
      <div className="flex bg-slate-100 p-1 rounded-2xl gap-1 w-fit">
        <button
          type="button"
          onClick={() => setActiveTab("chamados")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "chamados"
              ? "bg-white text-amber-800 shadow-xs"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          Chamados de Suporte ({tickets.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("logs")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "logs"
              ? "bg-white text-amber-800 shadow-xs"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          Trilha de Auditoria ({auditLogs.length})
        </button>
      </div>

      {/* Tab: Chamados */}
      {activeTab === "chamados" && (
        <Card className="border-slate-200 bg-white shadow-xs rounded-3xl overflow-hidden divide-y divide-slate-100">
          {tickets.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Nenhum chamado de suporte registrado.
            </div>
          ) : (
            tickets.map((t) => {
              const statusStyles = {
                open: "bg-amber-50 text-amber-700 border-amber-200",
                in_progress: "bg-blue-50 text-blue-700 border-blue-200",
                resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
                closed: "bg-slate-100 text-slate-500 border-slate-200",
              };

              return (
                <div
                  key={t.id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{t.subject}</span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] uppercase font-semibold ${
                          statusStyles[t.status as keyof typeof statusStyles] || ""
                        }`}
                      >
                        {t.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {t.users?.email || "Admin"}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Aberto em {new Date(t.created_at).toLocaleString("pt-BR")}
                      </span>
                    </div>
                  </div>

                  {/* Actions for Ticket Status */}
                  <div className="flex items-center gap-1.5 self-start sm:self-auto">
                    {t.status === "open" && (
                      <Button
                        type="button"
                        size="sm"
                        disabled={updatingTicketId === t.id}
                        onClick={() => handleStatusChange(t.id, "in_progress")}
                        className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 px-3"
                      >
                        Iniciar Atendimento
                      </Button>
                    )}
                    {(t.status === "open" || t.status === "in_progress") && (
                      <Button
                        type="button"
                        size="sm"
                        disabled={updatingTicketId === t.id}
                        onClick={() => handleStatusChange(t.id, "resolved")}
                        className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 px-3"
                      >
                        Resolver
                      </Button>
                    )}
                    {t.status === "resolved" && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={updatingTicketId === t.id}
                        onClick={() => handleStatusChange(t.id, "closed")}
                        className="rounded-xl text-xs h-8 px-3"
                      >
                        Fechar Chamado
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </Card>
      )}

      {/* Tab: Trilha de Auditoria */}
      {activeTab === "logs" && (
        <Card className="border-slate-200 bg-white shadow-xs rounded-3xl overflow-hidden divide-y divide-slate-100">
          {auditLogs.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Nenhum log registrado na trilha de auditoria.
            </div>
          ) : (
            auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 font-mono">{log.action}</span>
                    {log.resource_type && (
                      <Badge variant="outline" className="text-[10px] bg-slate-50 text-slate-600">
                        {log.resource_type}
                      </Badge>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Ator: <span className="font-medium text-slate-700">{log.users?.email || "Sistema"}</span>
                    {log.resource_id && (
                      <span className="font-mono text-slate-400 ml-2">ID: {log.resource_id}</span>
                    )}
                  </p>
                  {log.metadata && Object.keys(log.metadata).length > 0 && (
                    <div className="mt-1.5 p-2 rounded-xl bg-slate-50 border border-slate-100 font-mono text-[10px] text-slate-600 overflow-x-auto">
                      {JSON.stringify(log.metadata)}
                    </div>
                  )}
                </div>

                <span className="text-[11px] text-slate-400 whitespace-nowrap flex items-center gap-1 self-start sm:self-auto">
                  <Clock className="w-3 h-3" />
                  {new Date(log.created_at).toLocaleString("pt-BR")}
                </span>
              </div>
            ))
          )}
        </Card>
      )}
    </div>
  );
}
