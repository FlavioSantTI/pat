"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Calendar as CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { selfAssignActivityAction } from "@/lib/domain/patient-actions";

interface PatientNewAssignmentDialogProps {
  defaultDate?: string;
  buttonLabel?: string;
  variant?: "default" | "outline";
}

export function PatientNewAssignmentDialog({
  defaultDate,
  buttonLabel = "Nova Atribuição",
  variant = "default",
}: PatientNewAssignmentDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledDate, setScheduledDate] = useState(
    defaultDate || new Date().toISOString().slice(0, 10),
  );
  const [scheduledTime, setScheduledTime] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Por favor, digite o título da atividade.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await selfAssignActivityAction({
        title,
        description,
        scheduledDate,
        scheduledTime: scheduledTime || undefined,
      });

      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Atividade agendada com sucesso!");
        setTitle("");
        setDescription("");
        setIsOpen(false);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro ao agendar.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size="sm"
        onClick={() => setIsOpen(true)}
        className="rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5"
      >
        <Plus className="w-4 h-4" />
        {buttonLabel}
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="space-y-0.5">
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-indigo-600" />
                  Nova Atribuição
                </h3>
                <p className="text-xs text-slate-500">
                  Defina a atividade que você deseja realizar na sua rotina.
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Título da Atividade *</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Caminhada leve de 15 min, Exercício de respiração..."
                  className="rounded-xl border-slate-200 text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Descrição / Instrução (Opcional)</label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Sem celular, observando o ambiente ao redor..."
                  className="rounded-xl border-slate-200 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Data do Agendamento *</label>
                  <Input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="rounded-xl border-slate-200 text-xs"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Horário (Opcional)</label>
                  <Input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="rounded-xl border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl border-slate-200"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  size="sm"
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                >
                  {isLoading ? "Agendando..." : "Confirmar Atribuição"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
