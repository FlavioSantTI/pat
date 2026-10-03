import { requireRole } from "@/lib/auth/profile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sun, Calendar, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Hoje — Lumina",
  description: "Suas atividades e acompanhamento terapêutico de hoje.",
};

export default async function HojePage() {
  const profile = await requireRole("patient");

  const todayFormatted = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-indigo-600 font-medium text-xs uppercase tracking-wider">
          <Sun className="w-4 h-4 text-amber-500" />
          <span className="capitalize">{todayFormatted}</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Olá, {profile.displayName.split(" ")[0]}
        </h1>
        <p className="text-sm text-slate-500">
          Um passo de cada vez. Respeite o seu momento e comece pelo que for viável hoje.
        </p>
      </div>

      <Card className="border-slate-200/80 bg-white shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-slate-900 flex items-center justify-between">
            <span>Atividades de hoje</span>
            <span className="text-xs font-normal text-slate-500">Carregando plano...</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-sm text-slate-500 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-indigo-400 mx-auto stroke-1" />
            <p>Seu espaço terapêutico está pronto.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
