"use client";

import { useState } from "react";
import Link from "next/link";
import { startAssignmentAction, skipAssignmentAction } from "@/lib/domain/patient-actions";
import { FocusTimer } from "@/components/patient/focus-timer";
import { DpaAssessmentDialog } from "@/components/patient/dpa-assessment-dialog";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "cn";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  PlayCircle,
  HelpCircle,
  SkipForward,
} from "lucide-react";
import { PERIOD_LABELS, STATUS_LABELS } from "@/types";
import { toast } from "sonner";
import type { PatientActivityItem } from "@/lib/domain/patient";

export function ActivityView({ item }: { item: PatientActivityItem }) {
  const [assessmentOpen, setAssessmentOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusData, setFocusData] = useState<{
    enabled: boolean;
    minutes: number;
    elapsedSeconds: number;
  }>({
    enabled: false,
    minutes: 10,
    elapsedSeconds: 0,
  });

  const isCompleted = item.status === "completed";
  const isStarted = item.status === "started";
  const isScheduled = item.status === "scheduled";

  const handleStart = async () => {
    setIsLoading(true);
    try {
      await startAssignmentAction(item.id);
      toast.success("Atividade iniciada. Boa prática!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Não foi possível iniciar a atividade.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    if (!confirm("Deseja pular esta atividade por hoje?")) return;
    setIsLoading(true);
    try {
      await skipAssignmentAction(item.id);
      toast.info("Atividade adiada.");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro ao atualizar.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top back navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/hoje"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "text-slate-500 hover:text-slate-900 -ml-2 rounded-xl text-xs",
          )}
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Voltar para Hoje
        </Link>

        <Badge
          variant="outline"
          className={`text-xs font-semibold px-2.5 py-0.5 rounded-lg ${
            isCompleted
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : isStarted
                ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                : "bg-slate-50 text-slate-600 border-slate-200"
          }`}
        >
          {STATUS_LABELS[item.status]}
        </Badge>
      </div>

      {/* Main Activity Details Card */}
      <Card className="border-slate-200 bg-white shadow-xs rounded-3xl overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-indigo-50/40 p-5 sm:p-6 border-b border-slate-100">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100 text-xs border-transparent font-medium">
              {item.areaName}
            </Badge>

            <span className="text-xs text-slate-400">•</span>

            <span className="text-xs text-slate-500 font-medium">
              Período: {PERIOD_LABELS[item.period]}
            </span>

            {item.durationMinutes && (
              <>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {item.durationMinutes} min sugeridos
                </span>
              </>
            )}
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
            {item.title}
          </h1>

          {item.objective && (
            <p className="mt-2 text-sm text-slate-600 leading-relaxed font-medium">
              {item.objective}
            </p>
          )}
        </div>

        <CardContent className="p-5 sm:p-6 space-y-6">
          {/* Instructions */}
          {item.instructions && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
                Instruções passo a passo
              </h3>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 text-sm text-slate-700 leading-relaxed whitespace-pre-line font-mono sm:font-sans">
                {item.instructions}
              </div>
            </div>
          )}

          {/* Focus Timer */}
          {!isCompleted && (
            <FocusTimer onTimeUpdate={(data) => setFocusData(data)} />
          )}

          {/* Action buttons based on status */}
          <div className="pt-2">
            {isScheduled && (
              <div className="flex flex-col sm:flex-row items-center gap-2.5">
                <Button
                  onClick={handleStart}
                  disabled={isLoading}
                  className="w-full sm:flex-1 h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-base shadow-sm"
                >
                  <PlayCircle className="w-5 h-5 mr-2" />
                  Iniciar atividade
                </Button>

                <Button
                  onClick={handleSkip}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full sm:w-auto h-12 rounded-2xl border-slate-200 text-slate-600 hover:bg-slate-50 text-xs px-4"
                >
                  <SkipForward className="w-4 h-4 mr-1.5" />
                  Pular por hoje
                </Button>
              </div>
            )}

            {isStarted && (
              <div className="space-y-2.5">
                <Button
                  onClick={() => setAssessmentOpen(true)}
                  className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-base shadow-sm"
                >
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Concluir e Avaliar Experiência (D/P/A)
                </Button>
                <p className="text-center text-xs text-slate-400">
                  Atividade em andamento. Ao finalizar, registre como você se sentiu.
                </p>
              </div>
            )}

            {isCompleted && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
                <p className="text-sm font-bold text-emerald-900 flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Atividade concluída com sucesso!
                </p>
                <p className="text-xs text-emerald-700">
                  Sua reflexão D/P/A foi registrada no seu histórico clínico.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* DPA Dialog Modal */}
      <DpaAssessmentDialog
        open={assessmentOpen}
        onOpenChange={setAssessmentOpen}
        assignmentId={item.id}
        focusTimerData={focusData}
      />
    </div>
  );
}
