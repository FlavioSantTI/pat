"use client";

import { useState } from "react";
import { completeAssignmentAndAssessAction } from "@/lib/domain/patient-actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Sparkles, CheckCircle2 } from "lucide-react";

interface DpaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignmentId: string;
  focusTimerData?: {
    enabled: boolean;
    minutes: number;
    elapsedSeconds: number;
  };
}

const SCALE_VALUES = [0, 1, 2, 3, 4, 5];

export function DpaAssessmentDialog({
  open,
  onOpenChange,
  assignmentId,
  focusTimerData,
}: DpaDialogProps) {
  const [domainScore, setDomainScore] = useState<number>(3);
  const [pleasureScore, setPleasureScore] = useState<number>(2);
  const [anxietyScore, setAnxietyScore] = useState<number>(2);
  const [notes, setNotes] = useState("");
  const [gain, setGain] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await completeAssignmentAndAssessAction({
        assignmentId,
        domainScore,
        pleasureScore,
        anxietyScore,
        notes: notes.trim() || undefined,
        gain: gain.trim() || undefined,
        focusTimerEnabled: focusTimerData?.enabled,
        focusTimerMinutes: focusTimerData?.minutes,
        elapsedSeconds: focusTimerData?.elapsedSeconds,
      });

      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Atividade concluída e reflexão registrada com sucesso!");
        onOpenChange(false);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro ao concluir atividade.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-5 sm:p-6 rounded-3xl bg-white">
        <DialogHeader className="space-y-1.5 text-left">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-1">
            <Sparkles className="w-5 h-5" />
          </div>
          <DialogTitle className="text-xl font-bold text-slate-900">
            Como foi a experiência?
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 leading-relaxed">
            Uma breve reflexão funcional para seu terapeuta e para o seu próprio autoconhecimento.
            Não há respostas certas ou erradas.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          {/* Domínio (D) */}
          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <Label className="text-sm font-semibold text-slate-900">
                Domínio ou Realização (D)
              </Label>
              <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                Nota: {domainScore}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Quanto você conseguiu agir ou sustentar a tarefa, mesmo com desconforto?
            </p>
            <div className="grid grid-cols-6 gap-1.5 pt-1">
              {SCALE_VALUES.map((val) => (
                <button
                  key={`d-${val}`}
                  type="button"
                  onClick={() => setDomainScore(val)}
                  className={`h-11 rounded-xl text-sm font-bold transition-all border ${
                    domainScore === val
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-medium px-1">
              <span>0 = Quase nada</span>
              <span>5 = Realização alta</span>
            </div>
          </div>

          {/* Prazer (P) */}
          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <Label className="text-sm font-semibold text-slate-900">
                Prazer ou Satisfação (P)
              </Label>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                Nota: {pleasureScore}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Quanto de satisfação, alívio saudável ou bem-estar esteve presente?
            </p>
            <div className="grid grid-cols-6 gap-1.5 pt-1">
              {SCALE_VALUES.map((val) => (
                <button
                  key={`p-${val}`}
                  type="button"
                  onClick={() => setPleasureScore(val)}
                  className={`h-11 rounded-xl text-sm font-bold transition-all border ${
                    pleasureScore === val
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-medium px-1">
              <span>0 = Ausente</span>
              <span>5 = Muito prazeroso</span>
            </div>
          </div>

          {/* Ansiedade (A) */}
          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <Label className="text-sm font-semibold text-slate-900">
                Ansiedade ou Desconforto (A)
              </Label>
              <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                Nota: {anxietyScore}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Quanto de ansiedade, tensão ou aflição esteve presente durante a atividade?
            </p>
            <div className="grid grid-cols-6 gap-1.5 pt-1">
              {SCALE_VALUES.map((val) => (
                <button
                  key={`a-${val}`}
                  type="button"
                  onClick={() => setAnxietyScore(val)}
                  className={`h-11 rounded-xl text-sm font-bold transition-all border ${
                    anxietyScore === val
                      ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-medium px-1">
              <span>0 = Nenhuma</span>
              <span>5 = Muito alta</span>
            </div>
          </div>

          {/* Observação */}
          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-xs font-semibold text-slate-700">
              Observação pessoal (opcional)
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: O início foi difícil, mas ao passar dos 5 minutos o ritmo fluiu melhor."
              className="min-h-[70px] text-xs bg-slate-50/50 border-slate-200 resize-none rounded-xl"
            />
          </div>

          {/* Pequeno Ganho */}
          <div className="space-y-1.5 p-3.5 rounded-2xl bg-indigo-50/40 border border-indigo-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Registrar um pequeno ganho? (opcional)</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              Uma mudança observável na sua conduta (Ex: &quot;Comecei sem revisar tudo antes&quot;).
            </p>
            <Textarea
              id="gain"
              value={gain}
              onChange={(e) => setGain(e.target.value)}
              placeholder="Descreva a micro-vitória que deseja reconhecer..."
              className="min-h-[60px] text-xs bg-white border-indigo-200 resize-none rounded-xl mt-1.5"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => onOpenChange(false)}
              className="rounded-xl border-slate-200 text-xs text-slate-600"
            >
              Voltar
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs px-5 shadow-xs"
            >
              {isSubmitting ? (
                "Salvando..."
              ) : (
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Concluir e Salvar
                </span>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
