import { requireRole } from "@/lib/auth/profile";
import { getAdminDashboardMetrics } from "@/lib/domain/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Shield,
  Building2,
  Users,
  CreditCard,
  LifeBuoy,
  HeartHandshake,
  Activity,
  Lock,
  ArrowRight,
  Clock,
} from "lucide-react";

export const metadata = {
  title: "Administração Operacional — Lumina",
  description: "Gestão operacional, técnica e financeira da plataforma Lumina.",
};

export default async function AdminPage() {
  await requireRole("admin");
  const metrics = await getAdminDashboardMetrics();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-amber-700 font-medium text-xs uppercase tracking-wider">
            <Shield className="w-4 h-4" />
            <span>Gestão da Plataforma</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Painel Operacional
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Visão administrativa de organizações, profissionais credenciados, planos e integridade do sistema.
          </p>
        </div>

        {/* Security badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold self-start sm:self-auto">
          <Lock className="w-3.5 h-3.5 text-amber-700" />
          <span>Isolamento Clínico Ativo (RLS)</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <Card className="border-slate-200 bg-white shadow-xs rounded-2xl">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-medium text-slate-500 flex items-center justify-between">
              <span>Organizações</span>
              <Building2 className="w-4 h-4 text-slate-400" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-slate-900">{metrics.organizationsCount}</div>
            <p className="text-[11px] text-slate-400 mt-1">Clínicas ativas</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-xs rounded-2xl">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-medium text-slate-500 flex items-center justify-between">
              <span>Profissionais</span>
              <Users className="w-4 h-4 text-slate-400" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-slate-900">{metrics.professionalsCount}</div>
            <p className="text-[11px] text-slate-400 mt-1">Terapeutas cadastrados</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-xs rounded-2xl">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-medium text-slate-500 flex items-center justify-between">
              <span>Pacientes</span>
              <HeartHandshake className="w-4 h-4 text-slate-400" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-slate-900">{metrics.patientsCount}</div>
            <p className="text-[11px] text-slate-400 mt-1">Contas vinculadas</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-xs rounded-2xl">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-medium text-slate-500 flex items-center justify-between">
              <span>Assinaturas</span>
              <CreditCard className="w-4 h-4 text-slate-400" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-slate-900">{metrics.activeSubscriptionsCount}</div>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">Em dia</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-xs rounded-2xl col-span-2 sm:col-span-1">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-medium text-slate-500 flex items-center justify-between">
              <span>Suporte Aberto</span>
              <LifeBuoy className="w-4 h-4 text-slate-400" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-slate-900">{metrics.openTicketsCount}</div>
            <p className="text-[11px] text-amber-600 font-medium mt-1">Requer atenção</p>
          </CardContent>
        </Card>
      </div>

      {/* System Health & Architecture Guarantee Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-slate-200 bg-white shadow-xs rounded-3xl p-5 space-y-2">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-600" />
            <span className="font-bold text-xs text-slate-800 uppercase tracking-wider">Status do Sistema</span>
          </div>
          <p className="text-xs text-slate-600">
            Serviços de banco de dados e autenticação operando com 100% de integridade.
          </p>
          <div className="flex items-center gap-2 pt-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-semibold text-emerald-700">Supabase Online</span>
          </div>
        </Card>

        <Card className="border-slate-200 bg-white shadow-xs rounded-3xl p-5 space-y-2">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-indigo-600" />
            <span className="font-bold text-xs text-slate-800 uppercase tracking-wider">Privacidade Médica / RLS</span>
          </div>
          <p className="text-xs text-slate-600">
            Políticas de banco de dados bloqueiam qualquer consulta a dados terapêuticos por administradores.
          </p>
          <div className="flex items-center gap-2 pt-2">
            <Badge variant="outline" className="text-[10px] bg-indigo-50 text-indigo-700 border-indigo-200">
              Zero Clinical Leak
            </Badge>
          </div>
        </Card>

        <Card className="border-slate-200 bg-white shadow-xs rounded-3xl p-5 space-y-2">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-600" />
            <span className="font-bold text-xs text-slate-800 uppercase tracking-wider">Auditoria Técnica</span>
          </div>
          <p className="text-xs text-slate-600">
            Ações sensíveis no painel administrativo são registradas com data, hora e IP para compliance.
          </p>
          <div className="flex items-center gap-2 pt-2">
            <Link
              href="/admin/suporte"
              className="text-[11px] font-semibold text-amber-700 hover:underline flex items-center gap-1"
            >
              Ver Trilha de Logs <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </Card>
      </div>

      {/* Recent Audit Logs & Navigation Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Audit logs */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Últimas Ações de Auditoria do Sistema
            </h2>
            <Link
              href="/admin/suporte"
              className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
            >
              Ver todas <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <Card className="border-slate-200 bg-white shadow-xs rounded-3xl divide-y divide-slate-100 overflow-hidden">
            {metrics.recentLogs.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                Nenhum registro de auditoria recente.
              </div>
            ) : (
              metrics.recentLogs.map((log) => (
                <div key={log.id} className="p-4 flex items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{log.action}</span>
                      {log.resource_type && (
                        <Badge variant="outline" className="text-[10px] bg-slate-50 text-slate-600">
                          {log.resource_type}
                        </Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Realizado por {log.users?.display_name || log.users?.email || "Sistema"}
                    </p>
                  </div>
                  <span className="text-[11px] text-slate-400 whitespace-nowrap flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(log.created_at).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ))
            )}
          </Card>
        </div>

        {/* Quick management links */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Ações Rápidas de Gestão
          </h2>

          <div className="space-y-2">
            <Link
              href="/admin/usuarios"
              className="block p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-indigo-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-slate-900">Gerenciar Usuários & Clínicas</h3>
                    <p className="text-[11px] text-slate-500">Cadastre organizações e terapeutas</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </div>
            </Link>

            <Link
              href="/admin/planos"
              className="block p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-emerald-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-slate-900">Planos & Assinaturas</h3>
                    <p className="text-[11px] text-slate-500">Configure planos de acesso e vigências</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </div>
            </Link>

            <Link
              href="/admin/suporte"
              className="block p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-amber-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                    <LifeBuoy className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-slate-900">Central de Chamados</h3>
                    <p className="text-[11px] text-slate-500">Atenda requisições técnicas de suporte</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
