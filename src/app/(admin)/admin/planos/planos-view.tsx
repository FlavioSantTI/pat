"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { togglePlanStatusAction } from "@/lib/domain/admin-actions";
import { CreditCard, CheckCircle2, Building2, Calendar, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import type { AdminPlanRow, AdminSubscriptionRow } from "@/lib/domain/admin";

interface PlanosViewProps {
  plans: AdminPlanRow[];
  subscriptions: AdminSubscriptionRow[];
}

export function PlanosView({ plans, subscriptions }: PlanosViewProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleTogglePlan = async (planId: string, currentActive: boolean) => {
    setUpdatingId(planId);
    try {
      const res = await togglePlanStatusAction(planId, !currentActive);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success(`Plano ${!currentActive ? "ativado" : "desativado"} com sucesso!`);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro ao alterar plano.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Planos & Assinaturas
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Catálogo de planos de licenciamento Lumina e vigência de contratos das organizações ativas.
        </p>
      </div>

      {/* Plans Catalog */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Catálogo de Planos Oferecidos
          </h2>
          <span className="text-xs text-slate-400">{plans.length} modelos cadastrados</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {plans.map((p) => (
            <Card
              key={p.id}
              className={`rounded-3xl border transition-all ${
                p.active
                  ? "border-slate-200 bg-white shadow-xs"
                  : "border-slate-200 bg-slate-50/70 opacity-70"
              } p-5 sm:p-6 space-y-4 flex flex-col justify-between`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-semibold uppercase ${
                      p.active
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-slate-100 text-slate-500 border-slate-200"
                    }`}
                  >
                    {p.active ? "Ativo no Catálogo" : "Inativo"}
                  </Badge>
                  <span className="text-xs text-slate-400 font-medium capitalize">
                    {p.interval === "monthly" ? "Mensal" : p.interval === "yearly" ? "Anual" : p.interval}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900">{p.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Licenciamento profissional para acompanhamento terapêutico e análise funcional.
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Acesso ao Portal do Terapeuta</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>App PWA dos Pacientes (Hoje, D/P/A)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Isolamento Total por RLS e Criptografia</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={updatingId === p.id}
                  onClick={() => handleTogglePlan(p.id, p.active)}
                  className="w-full rounded-xl text-xs h-9"
                >
                  {updatingId === p.id
                    ? "Atualizando..."
                    : p.active
                      ? "Desativar Plano"
                      : "Ativar Plano"}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Contratos e Assinaturas das Organizações
          </h2>
          <span className="text-xs text-slate-400">{subscriptions.length} assinaturas</span>
        </div>

        <Card className="border-slate-200 bg-white shadow-xs rounded-3xl overflow-hidden divide-y divide-slate-100">
          {subscriptions.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Nenhuma assinatura registrada ainda.
            </div>
          ) : (
            subscriptions.map((sub) => (
              <div
                key={sub.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold shrink-0">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900">
                        {sub.organizations?.name || "Clínica Lumina"}
                      </h4>
                      <Badge
                        variant="outline"
                        className={`text-[10px] uppercase font-semibold ${
                          sub.status === "active"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {sub.status === "active" ? "Vigente" : sub.status}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      Plano: {sub.plans?.name || "Lumina Pro"} ({sub.plans?.interval || "mensal"})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-[11px] text-slate-500 self-start sm:self-auto">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      Renovação:{" "}
                      {sub.renews_at
                        ? new Date(sub.renews_at).toLocaleDateString("pt-BR")
                        : "Automática"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-700 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Faturamento Regular</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </Card>
      </div>
    </div>
  );
}
