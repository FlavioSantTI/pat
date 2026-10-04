"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "cn";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createGainAction } from "@/lib/domain/patient-actions";
import {
  Sparkles,
  Plus,
  ClipboardList,
  Target,
  Calendar,
  Folder,
} from "lucide-react";

import { toast } from "sonner";
import { PatientNewMetricDialog } from "@/components/patient/new-metric-dialog";

export type MetricItem = {

  id: string;
  area_name: string;
  observable_indicator: string;
  flexible_direction?: string | null;
  baseline_value?: string | null;
  current_value?: string | null;
  next_small_step?: string | null;
};

export type GainItem = {
  id: string;
  description: string;
  created_at: string;
};

export type ReviewItem = {
  id: string;
  week_start: string;
  smallest_gain: string;
  flexible_situation: string;
  increased_domain_or_pleasure: string;
  high_anxiety_analysis: string;
};

interface ProgressoViewProps {
  metrics: MetricItem[];
  gains: GainItem[];
  reviews: ReviewItem[];
}

export function ProgressoView({ metrics, gains, reviews }: ProgressoViewProps) {
  const [gainText, setGainText] = useState("");
  const [isSavingGain, setIsSavingGain] = useState(false);

  const handleAddGain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gainText.trim()) return;

    setIsSavingGain(true);
    try {
      const res = await createGainAction(gainText.trim());
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Pequeno ganho reconhecido e salvo!");
        setGainText("");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setIsSavingGain(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Meu Progresso Terapêutico
          </h1>
          <p className="text-xs text-slate-500 max-w-lg">
            Acompanhe suas direções de vida, indicadores observáveis e micro-conquistas.
            Aqui não há notas ou pontuações competitivas.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            href="/areas"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "rounded-2xl border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-xs shadow-xs",
            )}
          >
            <Folder className="w-4 h-4 mr-1.5 text-indigo-600" />
            + Áreas de Vida
          </Link>

          <Link
            href="/revisao"
            className={cn(
              buttonVariants({ variant: "default", size: "sm" }),
              "rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs shadow-xs",
            )}
          >
            <ClipboardList className="w-4 h-4 mr-1.5" />
            Revisão Semanal
          </Link>
        </div>
      </div>


      {/* Progress by Area Cards (BA-IACC Model) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-500" />
            Indicadores e Direções Flexíveis (BA-IACC)
          </h2>
          <PatientNewMetricDialog />
        </div>


        {metrics.length === 0 ? (
          <Card className="border-slate-200/80 bg-white rounded-2xl p-6 text-center text-slate-400">
            <p className="text-xs">Nenhum indicador cadastrado ainda no seu programa.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {metrics.map((m) => (
              <Card
                key={m.id}
                className="border-slate-200 bg-white shadow-xs rounded-3xl overflow-hidden"
              >
                <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-50 to-indigo-50/20 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Badge className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-0.5 rounded-lg border-transparent">
                      {m.area_name}
                    </Badge>
                    <span className="text-xs font-bold text-slate-800">
                      {m.observable_indicator}
                    </span>
                  </div>
                </div>

                <CardContent className="p-4 sm:p-5 space-y-4">
                  {m.flexible_direction && (
                    <div className="text-xs text-slate-600">
                      <span className="font-semibold text-slate-800">Direção desejada: </span>
                      {m.flexible_direction}
                    </div>
                  )}

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Linha de Base
                      </span>
                      <span className="text-sm font-semibold text-slate-700">
                        {m.baseline_value || "—"}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-indigo-600 block">
                        Estado Atual
                      </span>
                      <span className="text-sm font-bold text-indigo-700">
                        {m.current_value || "—"}
                      </span>
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                      <span className="text-[10px] uppercase font-bold text-emerald-600 block">
                        Próximo Passo Pequeno
                      </span>
                      <span className="text-xs font-medium text-slate-800 leading-snug">
                        {m.next_small_step || "Definir com terapeuta"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Pequenos Ganhos (Reconhecimento Qualitativo) */}
      <div id="ganho" className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Mural de Pequenos Ganhos
          </h2>
          <span className="text-xs text-slate-400 font-medium">{gains.length} reconhecidos</span>
        </div>

        {/* Form to add new qualitative gain */}
        <form
          onSubmit={handleAddGain}
          className="p-4 sm:p-5 rounded-3xl bg-indigo-50/40 border border-indigo-100 shadow-xs space-y-3"
        >
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-indigo-900">Reconhecer um pequeno ganho</h3>
            <p className="text-[11px] text-slate-500">
              Descreva uma mudança observável de comportamento, um início de tarefa ou um ato de flexibilidade.
            </p>
          </div>

          <div className="flex gap-2">
            <Input
              value={gainText}
              onChange={(e) => setGainText(e.target.value)}
              placeholder="Ex: Consegui fazer uma pausa quando notei a autocobrança..."
              className="bg-white border-indigo-200 text-xs rounded-xl h-10"
            />
            <Button
              type="submit"
              disabled={isSavingGain || !gainText.trim()}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs h-10 px-4 shrink-0 shadow-xs"
            >
              {isSavingGain ? "Salvando..." : <Plus className="w-4 h-4" />}
            </Button>
          </div>
        </form>

        {/* Gains list */}
        {gains.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">
            Nenhum pequeno ganho registrado ainda. Cada passo conta!
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {gains.map((g) => (
              <div
                key={g.id}
                className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-start gap-3"
              >
                <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-800 leading-relaxed">
                    &ldquo;{g.description}&rdquo;
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {new Date(g.created_at).toLocaleDateString("pt-BR", {
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Histórico de Revisões Semanais */}
      {reviews.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-indigo-500" />
            Histórico de Revisões
          </h2>

          <div className="space-y-3">
            {reviews.map((r) => (
              <div
                key={r.id}
                className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2 text-xs"
              >
                <div className="flex items-center justify-between font-semibold text-slate-800 pb-2 border-b border-slate-100">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                    Semana de {new Date(r.week_start).toLocaleDateString("pt-BR")}
                  </span>
                  <Badge variant="outline" className="text-[10px] text-slate-500">
                    Revisão Concluída
                  </Badge>
                </div>

                <div className="space-y-1 text-slate-600">
                  <p>
                    <strong className="text-slate-800">Menor ganho:</strong> {r.smallest_gain}
                  </p>
                  <p>
                    <strong className="text-slate-800">Situação flexível:</strong> {r.flexible_situation}
                  </p>
                  <p>
                    <strong className="text-slate-800">Domínio/Prazer:</strong> {r.increased_domain_or_pleasure}
                  </p>
                  <p>
                    <strong className="text-slate-800">Ansiedade a analisar:</strong> {r.high_anxiety_analysis}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
