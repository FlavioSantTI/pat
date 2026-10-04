"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle2, PlayCircle, Circle, ChevronRight, Trash2 } from "lucide-react";
import { PERIOD_LABELS, STATUS_LABELS } from "@/types";
import type { PatientActivityItem } from "@/lib/domain/patient";
import { deleteAssignmentAction } from "@/lib/domain/patient-actions";
import { toast } from "sonner";

export function ActivityCard({ item }: { item: PatientActivityItem }) {
  const isCompleted = item.status === "completed";
  const isStarted = item.status === "started";
  const isSkipped = item.status === "skipped";

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Deseja cancelar/excluir este agendamento de atividade?")) return;
    try {
      const res = await deleteAssignmentAction(item.id);
      if (res?.error) toast.error(res.error);
      else toast.info("Atividade removida da agenda.");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro ao remover.");
    }
  };

  return (
    <div className="relative group">
      <Link
        href={`/atividade/${item.id}`}
        className={`block p-4 rounded-2xl border transition-all duration-200 ${
          isCompleted
            ? "bg-emerald-50/40 border-emerald-200/80 hover:bg-emerald-50/70"
            : isStarted
              ? "bg-indigo-50/40 border-indigo-200 hover:bg-indigo-50/70 shadow-xs"
              : isSkipped
                ? "bg-slate-50/50 border-slate-200/60 opacity-60"
                : "bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-xs"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge
                variant="outline"
                className="text-[11px] font-medium border-slate-200 bg-slate-50 text-slate-600 px-2 py-0.5 rounded-md"
              >
                {item.areaName}
              </Badge>

              <span className="text-xs text-slate-400">•</span>

              <span className="text-xs font-medium text-slate-500">
                {PERIOD_LABELS[item.period]}
                {item.period === "specific_time" && item.scheduledAt && (
                  <span className="ml-1 text-slate-700 font-semibold">
                    {new Date(item.scheduledAt).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                )}
              </span>
            </div>

            <h3
              className={`font-semibold text-base leading-snug line-clamp-2 ${
                isCompleted
                  ? "text-emerald-950 line-through text-opacity-80"
                  : "text-slate-900"
              }`}
            >
              {item.title}
            </h3>

            {item.objective && (
              <p className="text-xs text-slate-500 line-clamp-1">
                {item.objective}
              </p>
            )}

            <div className="flex items-center gap-3 pt-1 text-xs text-slate-400">
              {item.durationMinutes && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {item.durationMinutes} min sugeridos
                </span>
              )}

              <span className="flex items-center gap-1 font-medium">
                {isCompleted ? (
                  <span className="text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Concluída
                  </span>
                ) : isStarted ? (
                  <span className="text-indigo-600 flex items-center gap-1">
                    <PlayCircle className="w-3.5 h-3.5 animate-pulse" /> Em andamento
                  </span>
                ) : (
                  <span className="text-slate-500 flex items-center gap-1">
                    <Circle className="w-3 h-3 text-slate-300" /> {STATUS_LABELS[item.status]}
                  </span>
                )}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 pt-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600 rounded-lg"
              title="Excluir agendamento"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
            <ChevronRight className="w-5 h-5 text-slate-300" />
          </div>
        </div>
      </Link>
    </div>
  );
}

