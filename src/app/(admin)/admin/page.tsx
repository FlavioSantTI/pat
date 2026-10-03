import { requireRole } from "@/lib/auth/profile";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Shield, Building2, Users, CreditCard } from "lucide-react";

export const metadata = {
  title: "Administração Operacional — Lumina",
  description: "Gestão operacional e financeira da plataforma Lumina.",
};

export default async function AdminPage() {
  const profile = await requireRole("admin");

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-amber-700 font-medium text-xs uppercase tracking-wider">
          <Shield className="w-4 h-4" />
          <span>Gestão da Plataforma</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Painel Operacional
        </h1>
        <p className="text-sm text-slate-500">
          Visão administrativa de organizações, profissionais, planos e saúde do sistema.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200/80 bg-white shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center justify-between">
              <span>Organizações</span>
              <Building2 className="w-4 h-4 text-slate-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">1</div>
            <p className="text-xs text-slate-500 mt-1">Clínica Bem Viver</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 bg-white shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center justify-between">
              <span>Profissionais</span>
              <Users className="w-4 h-4 text-slate-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">2</div>
            <p className="text-xs text-slate-500 mt-1">Dra. Ana e Dr. Paulo</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 bg-white shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center justify-between">
              <span>Planos Ativos</span>
              <CreditCard className="w-4 h-4 text-slate-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">3</div>
            <p className="text-xs text-slate-500 mt-1">Básico, Clínica, Instituição</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
