import { requireRole } from "@/lib/auth/profile";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Stethoscope } from "lucide-react";

export const metadata = {
  title: "Dashboard do Terapeuta — Lumina",
  description: "Acompanhamento clínico de pacientes.",
};

export default async function DashboardPage() {
  const profile = await requireRole("professional");

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-indigo-600 font-medium text-xs uppercase tracking-wider">
          <Stethoscope className="w-4 h-4" />
          <span>Portal Clínico</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Olá, {profile.displayName}
        </h1>
        <p className="text-sm text-slate-500">
          Gestão de programas, prescrição de atividades e acompanhamento funcional de pacientes vinculados.
        </p>
      </div>

      <Card className="border-slate-200/80 bg-white shadow-xs">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600" />
            <span>Pacientes Ativos</span>
          </CardTitle>
          <CardDescription>
            Pacientes sob seu acompanhamento terapêutico nesta clínica.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-sm text-slate-500">
            Painel do terapeuta carregado.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
