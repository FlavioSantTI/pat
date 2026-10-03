"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  createProgramAction,
  createProgramAreaAction,
  createActivityAction,
} from "@/lib/domain/professional-actions";
import {
  BookOpen,
  Plus,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Folder,
} from "lucide-react";
import { toast } from "sonner";
import type {
  ProgramWithDetails,
  ProgramAreaRow,
  ActivityRow,
} from "@/lib/domain/professional";

export function ProgramasView({ programs }: { programs: ProgramWithDetails[] }) {
  const [showNewProgram, setShowNewProgram] = useState(false);
  const [isCreatingProgram, setIsCreatingProgram] = useState(false);
  const [expandedProgramId, setExpandedProgramId] = useState<string | null>(
    programs[0]?.id ?? null,
  );
  const [activeNewActivityProgramId, setActiveNewActivityProgramId] = useState<string | null>(null);
  const [isCreatingActivity, setIsCreatingActivity] = useState(false);
  const [newAreaName, setNewAreaName] = useState("");
  const [activeAreaProgramId, setActiveAreaProgramId] = useState<string | null>(null);

  const handleCreateProgram = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsCreatingProgram(true);

    const formData = new FormData(e.currentTarget);
    try {
      const res = await createProgramAction(formData);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Programa terapêutico criado com sucesso!");
        setShowNewProgram(false);
        e.currentTarget.reset();
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro ao criar programa.");
    } finally {
      setIsCreatingProgram(false);
    }
  };

  const handleCreateActivity = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsCreatingActivity(true);

    const formData = new FormData(e.currentTarget);
    try {
      const res = await createActivityAction(formData);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Atividade cadastrada com sucesso na biblioteca do programa!");
        setActiveNewActivityProgramId(null);
        e.currentTarget.reset();
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro ao cadastrar atividade.");
    } finally {
      setIsCreatingActivity(false);
    }
  };

  const handleCreateArea = async (programId: string) => {
    if (!newAreaName.trim()) return;

    try {
      const res = await createProgramAreaAction(programId, newAreaName.trim());
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Área adicionada ao programa!");
        setNewAreaName("");
        setActiveAreaProgramId(null);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Programas & Biblioteca de Atividades
          </h1>
          <p className="text-xs text-slate-500">
            Estruture protocolos terapêuticos, áreas de foco e repertório de atividades.
          </p>
        </div>

        <Button
          onClick={() => setShowNewProgram(!showNewProgram)}
          className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs h-10 px-4 shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          {showNewProgram ? "Fechar Formulário" : "Novo Programa"}
        </Button>
      </div>

      {/* New Program Form */}
      {showNewProgram && (
        <Card className="border-indigo-200 bg-indigo-50/20 shadow-xs rounded-3xl p-5 sm:p-6 space-y-4 animate-in fade-in-50">
          <CardHeader className="p-0 pb-2">
            <CardTitle className="text-base font-bold text-slate-900">
              Criar Novo Programa Terapêutico
            </CardTitle>
          </CardHeader>
          <form onSubmit={handleCreateProgram} className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Nome do programa</Label>
              <Input name="name" required placeholder="Ex: Protocolo de Ativação Comportamental" className="rounded-xl h-10 text-xs bg-white" />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Descrição ou objetivo clínico</Label>
              <Textarea name="description" placeholder="Descreva os objetivos do programa..." className="rounded-xl text-xs bg-white min-h-[60px]" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Data de início (opcional)</Label>
                <Input name="start_date" type="date" className="rounded-xl h-10 text-xs bg-white" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Data de término (opcional)</Label>
                <Input name="end_date" type="date" className="rounded-xl h-10 text-xs bg-white" />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button type="submit" disabled={isCreatingProgram} className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs h-10 px-5 text-white">
                {isCreatingProgram ? "Criando..." : "Salvar Programa"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Programs List */}
      <div className="space-y-4">
        {programs.length === 0 ? (
          <Card className="border-slate-200 bg-white rounded-2xl p-8 text-center text-slate-400">
            <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2 stroke-1" />
            <p className="text-sm">Nenhum programa cadastrado. Crie o primeiro programa acima.</p>
          </Card>
        ) : (
          programs.map((program) => {
            const isExpanded = expandedProgramId === program.id;
            const areas = program.program_areas ?? [];
            const activities = program.activities ?? [];

            return (
              <Card
                key={program.id}
                className="border-slate-200 bg-white shadow-xs rounded-3xl overflow-hidden"
              >
                {/* Program Header */}
                <div
                  onClick={() => setExpandedProgramId(isExpanded ? null : program.id)}
                  className="p-5 sm:p-6 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base sm:text-lg text-slate-900">
                        {program.name}
                      </h3>
                      <Badge variant="outline" className="text-[10px] bg-slate-50 text-slate-600">
                        {activities.length} atividade{activities.length !== 1 ? "s" : ""}
                      </Badge>
                    </div>
                    {program.description && (
                      <p className="text-xs text-slate-500 line-clamp-1">{program.description}</p>
                    )}
                  </div>

                  <div className="text-slate-400">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>

                {/* Expanded Details: Areas and Activities */}
                {isExpanded && (
                  <CardContent className="p-5 sm:p-6 pt-0 border-t border-slate-100 space-y-6">
                    {/* Areas section */}
                    <div className="pt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                          <Folder className="w-3.5 h-3.5 text-indigo-500" />
                          Áreas do Programa
                        </h4>
                        <button
                          type="button"
                          onClick={() => setActiveAreaProgramId(program.id)}
                          className="text-xs font-semibold text-indigo-600 hover:underline"
                        >
                          + Adicionar Área
                        </button>
                      </div>

                      {activeAreaProgramId === program.id && (
                        <div className="flex gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                          <Input
                            value={newAreaName}
                            onChange={(e) => setNewAreaName(e.target.value)}
                            placeholder="Nome da área (Ex: Flexibilidade, Comunicação)"
                            className="rounded-xl h-9 text-xs bg-white"
                          />
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => handleCreateArea(program.id)}
                            className="rounded-xl bg-indigo-600 text-xs px-3 text-white"
                          >
                            Salvar
                          </Button>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-1.5">
                        {areas.map((a: ProgramAreaRow) => (
                          <Badge
                            key={a.id}
                            variant="outline"
                            className="bg-slate-50 text-slate-700 text-xs py-1 px-2.5 rounded-lg border-slate-200"
                          >
                            {a.name}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Activities Library Section */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                          Biblioteca de Atividades ({activities.length})
                        </h4>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() =>
                            setActiveNewActivityProgramId(
                              activeNewActivityProgramId === program.id ? null : program.id,
                            )
                          }
                          className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs h-8 px-3"
                        >
                          <Plus className="w-3.5 h-3.5 mr-1" />
                          Nova Atividade
                        </Button>
                      </div>

                      {/* New Activity Form for this Program */}
                      {activeNewActivityProgramId === program.id && (
                        <Card className="border-indigo-100 bg-indigo-50/20 rounded-2xl p-4 sm:p-5 space-y-3 animate-in fade-in-50">
                          <h5 className="text-xs font-bold text-slate-900">
                            Cadastrar Atividade no {program.name}
                          </h5>
                          <form onSubmit={handleCreateActivity} className="space-y-3">
                            <input type="hidden" name="program_id" value={program.id} />

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <Label className="text-xs">Título da atividade</Label>
                                <Input name="title" required placeholder="Ex: Preparar café sem pressa" className="rounded-xl h-10 text-xs bg-white" />
                              </div>

                              <div className="space-y-1">
                                <Label className="text-xs">Área temática</Label>
                                <select
                                  name="program_area_id"
                                  className="w-full h-10 px-3 text-xs bg-white border border-slate-200 rounded-xl focus:outline-indigo-500"
                                >
                                  <option value="">Selecione uma área...</option>
                                  {areas.map((a: ProgramAreaRow) => (
                                    <option key={a.id} value={a.id}>
                                      {a.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <Label className="text-xs">Objetivo funcional</Label>
                              <Input name="objective" placeholder="Ex: Desacelerar e notar o presente" className="rounded-xl h-10 text-xs bg-white" />
                            </div>

                            <div className="space-y-1">
                              <Label className="text-xs">Instruções passo a passo</Label>
                              <Textarea name="instructions" placeholder="1. Separe os ingredientes...&#10;2. Respire fundo...&#10;3. Sente-se por 10 minutos." className="rounded-xl text-xs bg-white min-h-[70px]" />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <Label className="text-xs">Duração sugerida (minutos)</Label>
                                <Input name="duration_suggested_minutes" type="number" defaultValue="15" className="rounded-xl h-10 text-xs bg-white" />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Dificuldade sugerida</Label>
                                <Input name="difficulty" defaultValue="leve" className="rounded-xl h-10 text-xs bg-white" />
                              </div>
                            </div>

                            <div className="pt-2 flex justify-end gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setActiveNewActivityProgramId(null)}
                                className="rounded-xl text-xs"
                              >
                                Cancelar
                              </Button>
                              <Button
                                type="submit"
                                disabled={isCreatingActivity}
                                className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-4"
                              >
                                {isCreatingActivity ? "Salvando..." : "Salvar Atividade"}
                              </Button>
                            </div>
                          </form>
                        </Card>
                      )}

                      {/* Activities Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {activities.map((act: ActivityRow) => {
                          const actArea = areas.find((a: ProgramAreaRow) => a.id === act.program_area_id);
                          return (
                            <div
                              key={act.id}
                              className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1.5"
                            >
                              <div className="flex items-center justify-between">
                                <Badge className="bg-indigo-100 text-indigo-800 text-[10px] py-0 px-2 rounded-md font-medium border-transparent">
                                  {actArea?.name || "Geral"}
                                </Badge>
                                {act.duration_suggested_minutes && (
                                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> {act.duration_suggested_minutes} min
                                  </span>
                                )}
                              </div>
                              <h5 className="font-bold text-xs text-slate-900 leading-snug">
                                {act.title}
                              </h5>
                              {act.objective && (
                                <p className="text-[11px] text-slate-500 line-clamp-1">
                                  {act.objective}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
