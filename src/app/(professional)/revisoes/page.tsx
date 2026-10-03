import { requireRole } from "@/lib/auth/profile";
import {
  getProfessionalWeeklyReviews,
  type WeeklyReviewWithPatient,
} from "@/lib/domain/professional";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { ClipboardCheck, Calendar, User, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Revisões Semanais dos Pacientes — Lumina",
  description: "Sínteses funcionais semanais dos pacientes acompanhados.",
};

export default async function ProfessionalRevisoesPage() {
  const profile = await requireRole("professional");
  const reviews = await getProfessionalWeeklyReviews(profile.professionalId!);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Revisões Semanais dos Pacientes
        </h1>
        <p className="text-xs text-slate-500">
          Sínteses funcionais preenchidas para orientar a formulação de caso e os tópicos da próxima sessão.
        </p>
      </div>

      {reviews.length === 0 ? (
        <Card className="border-slate-200 bg-white rounded-3xl p-8 text-center text-slate-400">
          <ClipboardCheck className="w-8 h-8 text-slate-300 mx-auto mb-2 stroke-1" />
          <p className="text-sm">Nenhuma revisão semanal submetida pelos pacientes ainda.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((r: WeeklyReviewWithPatient) => (
            <Card
              key={r.id}
              className="border-slate-200 bg-white shadow-xs rounded-3xl overflow-hidden p-5 sm:p-6 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">
                      {r.patients?.display_name || "Paciente"}
                    </h3>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Semana de {new Date(r.week_start).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>

                <Link
                  href={`/pacientes/${r.patients?.id}`}
                  className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1 self-start sm:self-auto"
                >
                  Ver Prontuário <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-700">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="font-bold text-indigo-900 block text-[11px] uppercase tracking-wider">
                    1. Menor ganho reconhecido
                  </span>
                  <p className="leading-relaxed">{r.smallest_gain}</p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="font-bold text-indigo-900 block text-[11px] uppercase tracking-wider">
                    2. Situação de flexibilidade
                  </span>
                  <p className="leading-relaxed">{r.flexible_situation}</p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="font-bold text-emerald-900 block text-[11px] uppercase tracking-wider">
                    3. O que aumentou domínio ou prazer
                  </span>
                  <p className="leading-relaxed">{r.increased_domain_or_pleasure}</p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="font-bold text-amber-900 block text-[11px] uppercase tracking-wider">
                    4. Ponto para análise funcional na sessão
                  </span>
                  <p className="leading-relaxed">{r.high_anxiety_analysis}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
