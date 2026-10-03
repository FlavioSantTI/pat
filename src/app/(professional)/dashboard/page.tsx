import { requireRole } from "@/lib/auth/profile";
import { getProfessionalDashboardData } from "@/lib/domain/professional";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "cn";
import Link from "next/link";
import {
  Users,
  BookOpen,
  ClipboardCheck,
  Stethoscope,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export const metadata = {
  title: "Dashboard do Terapeuta — Lumina",
  description: "Acompanhamento clínico de pacientes.",
};

export default async function DashboardPage() {
  const profile = await requireRole("professional");
  const data = await getProfessionalDashboardData(profile.professionalId!);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-600 font-medium text-xs uppercase tracking-wider">
            <Stethoscope className="w-4 h-4" />
            <span>Portal Clínico</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Olá, {profile.displayName}
          </h1>
          <p className="text-xs text-slate-500">
            Acompanhe o percurso terapêutico, indicadores e registros funcionais dos seus pacientes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/programas"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "rounded-xl border-slate-200 text-xs shadow-xs",
            )}
          >
            <BookOpen className="w-4 h-4 mr-1.5" />
            Gerenciar Programas
          </Link>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border-slate-200 bg-white shadow-xs rounded-2xl">
          <CardHeader className="pb-2 p-4">
            <CardTitle className="text-xs font-semibold text-slate-500 flex items-center justify-between">
              <span>Pacientes Vinculados</span>
              <Users className="w-4 h-4 text-indigo-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-slate-900">{data.patients.length}</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Em atendimento ativo</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-xs rounded-2xl">
          <CardHeader className="pb-2 p-4">
            <CardTitle className="text-xs font-semibold text-slate-500 flex items-center justify-between">
              <span>Programas Ativos</span>
              <BookOpen className="w-4 h-4 text-indigo-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-slate-900">{data.programsCount}</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Cadastrados por você</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-xs rounded-2xl">
          <CardHeader className="pb-2 p-4">
            <CardTitle className="text-xs font-semibold text-slate-500 flex items-center justify-between">
              <span>Biblioteca de Ações</span>
              <Sparkles className="w-4 h-4 text-indigo-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-slate-900">{data.activitiesCount}</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Atividades terapêuticas</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-xs rounded-2xl">
          <CardHeader className="pb-2 p-4">
            <CardTitle className="text-xs font-semibold text-slate-500 flex items-center justify-between">
              <span>Revisões Semanais</span>
              <ClipboardCheck className="w-4 h-4 text-indigo-600" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-slate-900">{data.recentReviewsCount}</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Disponíveis para análise</p>
          </CardContent>
        </Card>
      </div>

      {/* Linked Patients List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Pacientes em Acompanhamento
          </h2>
          <span className="text-xs text-slate-400">{data.patients.length} pacientes</span>
        </div>

        {data.patients.length === 0 ? (
          <Card className="border-slate-200 bg-white rounded-2xl p-8 text-center text-slate-400">
            <Users className="w-8 h-8 text-slate-300 mx-auto mb-2 stroke-1" />
            <p className="text-sm">Nenhum paciente vinculado no momento.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {data.patients.map((p) => (
              <Card
                key={p.id}
                className="border-slate-200/90 bg-white shadow-xs hover:shadow-sm hover:border-slate-300 transition-all rounded-3xl overflow-hidden"
              >
                <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between">
                  <div className="space-y-0.5">
                    <CardTitle className="text-base font-bold text-slate-900">
                      {p.displayName}
                    </CardTitle>
                    <p className="text-xs text-slate-400">{p.email || "Sem e-mail"}</p>
                  </div>
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-semibold">
                    Ativo
                  </Badge>
                </CardHeader>

                <CardContent className="p-5 pt-0 space-y-4">
                  <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                        Agendadas / Em curso
                      </span>
                      <span className="text-sm font-bold text-indigo-600">
                        {p.activeAssignmentsCount}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                        Concluídas
                      </span>
                      <span className="text-sm font-bold text-emerald-600">
                        {p.completedAssignmentsCount}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/pacientes/${p.id}`}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "w-full justify-between h-10 rounded-xl border-slate-200 text-slate-700 hover:text-indigo-600 hover:border-indigo-200 text-xs font-semibold",
                    )}
                  >
                    <span>Ver Prontuário & Atribuir</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
