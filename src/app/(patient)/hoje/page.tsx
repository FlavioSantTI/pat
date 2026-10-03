import { requireRole } from "@/lib/auth/profile";
import { getTodayAssignments } from "@/lib/domain/patient";
import { ActivityCard } from "@/components/patient/activity-card";
import { Card, CardContent } from "@/components/ui/card";
import { Sun, Sparkles, HeartHandshake } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "cn";

export const metadata = {
  title: "Hoje — Lumina",
  description: "Suas atividades e acompanhamento terapêutico de hoje.",
};

export default async function HojePage() {
  const profile = await requireRole("patient");
  const items = await getTodayAssignments(profile.patientId!);

  const todayFormatted = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  const morningItems = items.filter((i) => i.period === "morning");
  const afternoonItems = items.filter((i) => i.period === "afternoon");
  const nightItems = items.filter((i) => i.period === "night");
  const specificItems = items.filter((i) => i.period === "specific_time");

  const completedCount = items.filter((i) => i.status === "completed").length;

  return (
    <div className="space-y-6">
      {/* Greeting and reassurance */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-indigo-600 font-medium text-xs uppercase tracking-wider">
          <Sun className="w-4 h-4 text-amber-500" />
          <span className="capitalize">{todayFormatted}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Olá, {profile.displayName.split(" ")[0]}
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed max-w-xl">
          Um passo de cada vez. Respeite o seu ritmo e escolha começar pelo que for possível hoje, sem cobrança.
        </p>
      </div>

      {/* Quick summary card */}
      {items.length > 0 && (
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <HeartHandshake className="w-4 h-4 text-indigo-500" />
            <span>
              {completedCount === items.length && items.length > 0
                ? "Todas as atividades de hoje foram concluídas ou acolhidas."
                : `${completedCount} de ${items.length} atividade${items.length > 1 ? "s" : ""} realizada${items.length > 1 ? "s" : ""}.`}
            </span>
          </div>
          <Link href="/agenda" className="text-indigo-600 font-semibold hover:underline">
            Ver agenda completa
          </Link>
        </div>
      )}

      {/* Activities list grouped by period */}
      {items.length === 0 ? (
        <Card className="border-slate-200/80 bg-white shadow-xs rounded-2xl">
          <CardContent className="py-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-slate-800 text-base">
                Nenhuma atividade programada para hoje
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Aproveite o momento para descansar, consultar suas metas ou registrar um pequeno ganho.
              </p>
            </div>
            <div className="pt-2 flex justify-center gap-2">
              <Link
                href="/progresso"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "rounded-xl border-slate-200",
                )}
              >
                Ver meu progresso
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {morningItems.length > 0 && (
            <div className="space-y-2.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
                Manhã
              </h2>
              <div className="space-y-2.5">
                {morningItems.map((item) => (
                  <ActivityCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}

          {afternoonItems.length > 0 && (
            <div className="space-y-2.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
                Tarde
              </h2>
              <div className="space-y-2.5">
                {afternoonItems.map((item) => (
                  <ActivityCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}

          {nightItems.length > 0 && (
            <div className="space-y-2.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
                Noite
              </h2>
              <div className="space-y-2.5">
                {nightItems.map((item) => (
                  <ActivityCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}

          {specificItems.length > 0 && (
            <div className="space-y-2.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
                Horário Específico
              </h2>
              <div className="space-y-2.5">
                {specificItems.map((item) => (
                  <ActivityCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Encouragement footer */}
      <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex items-center justify-between gap-3">
        <div className="space-y-0.5">
          <p className="text-xs font-bold text-indigo-900">Percebeu alguma melhora sutil?</p>
          <p className="text-[11px] text-indigo-700/80">Reconhecer um pequeno avanço fortalece sua autonomia.</p>
        </div>
        <Link
          href="/progresso#ganho"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "bg-white border-indigo-200 text-indigo-700 hover:bg-indigo-50 rounded-xl shrink-0 text-xs",
          )}
        >
          + Registrar ganho
        </Link>
      </div>
    </div>
  );
}
