"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Target } from "lucide-react";
import { toast } from "sonner";
import { createPatientMetricAction } from "@/lib/domain/patient-actions";

export function PatientNewMetricDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [areaName, setAreaName] = useState("");
  const [observableIndicator, setObservableIndicator] = useState("");
  const [flexibleDirection, setFlexibleDirection] = useState("");
  const [baselineValue, setBaselineValue] = useState("");
  const [currentValue, setCurrentValue] = useState("");
  const [nextSmallStep, setNextSmallStep] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!areaName.trim() || !observableIndicator.trim()) {
      toast.error("Por favor, preencha a Área de Vida e o Indicador Observável.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await createPatientMetricAction({
        areaName,
        observableIndicator,
        flexibleDirection,
        baselineValue,
        currentValue,
        nextSmallStep,
      });

      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Indicador BA-IACC cadastrado com sucesso!");
        setAreaName("");
        setObservableIndicator("");
        setFlexibleDirection("");
        setBaselineValue("");
        setCurrentValue("");
        setNextSmallStep("");
        setIsOpen(false);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro ao cadastrar indicador.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="rounded-xl border-indigo-200 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-100 text-xs font-semibold shadow-xs flex items-center gap-1.5"
      >
        <Plus className="w-4 h-4" />
        Novo Indicador (BA-IACC)
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="space-y-0.5">
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Target className="w-4 h-4 text-indigo-600" />
                  Novo Indicador (BA-IACC)
                </h3>
                <p className="text-xs text-slate-500">
                  Cadastre um comportamento observável e sua linha de base para acompanhamento.
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Área de Vida *</label>
                <Input
                  value={areaName}
                  onChange={(e) => setAreaName(e.target.value)}
                  placeholder="Ex: Trabalho & Carreira, Saúde Física, Relacionamentos..."
                  className="rounded-xl border-slate-200 text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Indicador Observável *</label>
                <Input
                  value={observableIndicator}
                  onChange={(e) => setObservableIndicator(e.target.value)}
                  placeholder="Ex: Minutos de caminhada por dia, Pausas para respiração..."
                  className="rounded-xl border-slate-200 text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Direção Flexível (Opcional)</label>
                <Input
                  value={flexibleDirection}
                  onChange={(e) => setFlexibleDirection(e.target.value)}
                  placeholder="Ex: Aumentar presença e flexibilidade com cobranças..."
                  className="rounded-xl border-slate-200 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Linha de Base (Frequência inicial)</label>
                  <Input
                    value={baselineValue}
                    onChange={(e) => setBaselineValue(e.target.value)}
                    placeholder="Ex: 0x por semana"
                    className="rounded-xl border-slate-200 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Estado Atual</label>
                  <Input
                    value={currentValue}
                    onChange={(e) => setCurrentValue(e.target.value)}
                    placeholder="Ex: 2x por semana"
                    className="rounded-xl border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Próximo Passo Pequeno</label>
                <Input
                  value={nextSmallStep}
                  onChange={(e) => setNextSmallStep(e.target.value)}
                  placeholder="Ex: Dar uma volta na quadra por 10 minutos na terça-feira"
                  className="rounded-xl border-slate-200 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
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
                  {isLoading ? "Cadastrando..." : "Salvar Indicador"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
