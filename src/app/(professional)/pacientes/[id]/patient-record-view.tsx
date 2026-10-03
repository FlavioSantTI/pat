"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "cn";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  assignActivityAction,
  saveProfessionalNoteAction,
  savePatientMetricAction,
} from "@/lib/domain/professional-actions";
import {
  ArrowLeft,
  Calendar,
  Lock,
  Plus,
  Target,
  ClipboardList,
  User,
} from "lucide-react";
import { PERIOD_LABELS, STATUS_LABELS } from "@/types";
import { toast } from "sonner";
import type {
  PatientClinicalRecord,
  ActivityRow,
  ProgramWithDetails,
  ClinicalAssignment,
  ProgressMetricRow,
  WeeklyReviewRow,
  ProfessionalNoteRow,
} from "@/lib/domain/professional";

interface RecordProps {
  data: PatientClinicalRecord;
  availableActivities: ActivityRow[];
  programs: ProgramWithDetails[];
}

export function PatientRecordView({ data, availableActivities, programs }: RecordProps) {
  const [activeTab, setActiveTab] = useState<"atividades" | "atribuir" | "indicadores" | "revisoes" | "notas">("atividades");
  const [noteContent, setNoteContent] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isSavingMetric, setIsSavingMetric] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("morning");

  const { patient, assignments, metrics, gains, reviews, notes } = data;

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;

    setIsSavingNote(true);
    try {
      const res = await saveProfessionalNoteAction(patient.id, noteContent.trim());
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Nota clínica registrada com segurança!");
        setNoteContent("");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar nota.");
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleAssign = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsAssigning(true);

    const formData = new FormData(e.currentTarget);
    formData.append("patient_id", patient.id);

    try {
      const res = await assignActivityAction(formData);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Atividade atribuída com sucesso para o paciente!");
        setActiveTab("atividades");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro na atribuição.");
    } finally {
      setIsAssigning(false);
    }
  };

  const handleSaveMetric = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSavingMetric(true);

    const formData = new FormData(e.currentTarget);
    formData.append("patient_id", patient.id);

    try {
      const res = await savePatientMetricAction(formData);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Indicador registrado no prontuário!");
        e.currentTarget.reset();
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar métrica.");
    } finally {
      setIsSavingMetric(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top back button */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "text-slate-500 -ml-2 rounded-xl text-xs",
          )}
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Voltar para Pacientes
        </Link>
      </div>

      {/* Patient Header Card */}
      <Card className="border-slate-200 bg-white shadow-xs rounded-3xl overflow-hidden">
        <CardContent className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <User className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {patient.displayName}
                </h1>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                  Vínculo Ativo
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{patient.email || "Sem e-mail cadastrado"}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="text-xs text-slate-500">
                  <strong className="text-slate-700">{assignments.filter((a) => a.status === "completed").length}</strong> concluídas
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs text-indigo-600 font-medium">
                  <strong>{gains.length}</strong> pequenos ganhos
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs text-slate-500">
                  <strong className="text-slate-700">{reviews.length}</strong> revisões
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={() => setActiveTab("atribuir")}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs h-10 px-4 shadow-xs"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Atribuir Atividade
            </Button>
          </div>
        </CardContent>

        {/* Tab switcher */}
        <div className="flex border-t border-slate-100 bg-slate-50/60 px-4 sm:px-6 overflow-x-auto gap-2 py-2">
          {[
            { id: "atividades" as const, label: "Atividades & D/P/A", icon: Calendar },
            { id: "atribuir" as const, label: "Nova Atribuição", icon: Plus },
            { id: "indicadores" as const, label: "Indicadores (BA-IACC)", icon: Target },
            { id: "revisoes" as const, label: "Revisões Semanais", icon: ClipboardList },
            { id: "notas" as const, label: "Notas Confidenciais", icon: Lock },
          ].map((tab) => {
            const Icon = tab.icon;
            const isCurrent = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isCurrent
                    ? "bg-white text-indigo-600 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Tab: ATIVIDADES & D/P/A */}
      {activeTab === "atividades" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Histórico de Execuções e Avaliações D/P/A
            </h2>
            <span className="text-xs text-slate-400">{assignments.length} registros</span>
          </div>

          {assignments.length === 0 ? (
            <Card className="border-slate-200 bg-white rounded-2xl p-8 text-center text-slate-400">
              <p className="text-xs">Nenhuma atividade agendada ou executada ainda para este paciente.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {assignments.map((item: ClinicalAssignment) => {
                const session = item.activity_sessions?.[0];
                const assess = session?.activity_assessments?.[0];

                return (
                  <Card
                    key={item.id}
                    className="border-slate-200 bg-white shadow-xs rounded-2xl p-4 sm:p-5 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">
                            {item.activities?.title}
                          </span>
                          <Badge variant="outline" className="text-[10px] text-slate-500">
                            {item.activities?.program_areas?.name || "Geral"}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-400">
                          {new Date(item.scheduled_date).toLocaleDateString("pt-BR")} • Período:{" "}
                          {PERIOD_LABELS[item.period as keyof typeof PERIOD_LABELS]}
                        </p>
                      </div>

                      <Badge
                        variant="outline"
                        className={`text-[11px] self-start sm:self-auto font-medium ${
                          item.status === "completed"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : item.status === "started"
                              ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                              : "bg-slate-50 text-slate-500"
                        }`}
                      >
                        {STATUS_LABELS[item.status as keyof typeof STATUS_LABELS]}
                      </Badge>
                    </div>

                    {/* D/P/A Score Display if completed */}
                    {assess && (
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                          <div className="p-2 rounded-lg bg-indigo-50/70 border border-indigo-100">
                            <span className="text-[10px] uppercase font-bold text-indigo-700 block">
                              Domínio (D)
                            </span>
                            <span className="text-base font-bold text-indigo-900">
                              {assess.domain_score} / 5
                            </span>
                          </div>

                          <div className="p-2 rounded-lg bg-emerald-50/70 border border-emerald-100">
                            <span className="text-[10px] uppercase font-bold text-emerald-700 block">
                              Prazer (P)
                            </span>
                            <span className="text-base font-bold text-emerald-900">
                              {assess.pleasure_score} / 5
                            </span>
                          </div>

                          <div className="p-2 rounded-lg bg-amber-50/70 border border-amber-100">
                            <span className="text-[10px] uppercase font-bold text-amber-700 block">
                              Ansiedade (A)
                            </span>
                            <span className="text-base font-bold text-amber-900">
                              {assess.anxiety_score} / 5
                            </span>
                          </div>
                        </div>

                        {session?.notes && (
                          <p className="text-xs text-slate-600 pt-1">
                            <strong className="text-slate-800">Nota do paciente:</strong> &ldquo;{session.notes}&rdquo;
                          </p>
                        )}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab: NOVA ATRIBUIÇÃO */}
      {activeTab === "atribuir" && (
        <Card className="border-slate-200 bg-white shadow-xs rounded-3xl p-5 sm:p-6 space-y-4">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-lg font-bold text-slate-900">
              Atribuir Atividade para {patient.displayName}
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Defina a atividade, a data prevista e o período do dia sugerido.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleAssign} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="activity_id" className="text-xs font-semibold text-slate-700">
                Selecione a atividade do programa
              </Label>
              <select
                id="activity_id"
                name="activity_id"
                required
                className="w-full h-11 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-indigo-500 font-medium text-slate-800"
              >
                <option value="">Selecione uma atividade cadastrada...</option>
                {availableActivities.map((act) => (
                  <option key={act.id} value={act.id}>
                    {act.title} ({act.duration_suggested_minutes ? `${act.duration_suggested_minutes} min` : "Livre"})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="scheduled_date" className="text-xs font-semibold text-slate-700">
                  Data agendada
                </Label>
                <Input
                  id="scheduled_date"
                  name="scheduled_date"
                  type="date"
                  defaultValue={new Date().toISOString().slice(0, 10)}
                  required
                  className="rounded-xl h-11 text-xs bg-slate-50 border-slate-200"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="period" className="text-xs font-semibold text-slate-700">
                  Período sugerido
                </Label>
                <select
                  id="period"
                  name="period"
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="w-full h-11 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-indigo-500 font-medium text-slate-800"
                >
                  <option value="morning">Manhã</option>
                  <option value="afternoon">Tarde</option>
                  <option value="night">Noite</option>
                  <option value="specific_time">Horário Específico</option>
                </select>
              </div>
            </div>

            {selectedPeriod === "specific_time" && (
              <div className="space-y-1.5">
                <Label htmlFor="scheduled_at" className="text-xs font-semibold text-slate-700">
                  Horário específico (Data & Hora)
                </Label>
                <Input
                  id="scheduled_at"
                  name="scheduled_at"
                  type="datetime-local"
                  required
                  className="rounded-xl h-11 text-xs bg-slate-50 border-slate-200"
                />
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <Button
                type="submit"
                disabled={isAssigning}
                className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs h-11 px-6 shadow-xs"
              >
                {isAssigning ? "Atribuindo..." : "Confirmar Atribuição"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Tab: INDICADORES BA-IACC */}
      {activeTab === "indicadores" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Direções de Vida e Indicadores Funcionais
            </h2>
            <span className="text-xs text-slate-400">{metrics.length} ativos</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {metrics.map((m: ProgressMetricRow) => (
              <Card key={m.id} className="border-slate-200 bg-white rounded-2xl p-4 sm:p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{m.observable_indicator}</span>
                  <Badge variant="outline" className="text-[10px] bg-slate-50 text-slate-600">
                    {m.area_name}
                  </Badge>
                </div>
                {m.flexible_direction && (
                  <p className="text-xs text-slate-600">
                    <strong className="text-slate-700">Direção:</strong> {m.flexible_direction}
                  </p>
                )}
                <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl text-xs border border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Linha de Base</span>
                    <span className="font-semibold">{m.baseline_value || "—"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-indigo-600 font-bold uppercase block">Atual</span>
                    <span className="font-bold text-indigo-700">{m.current_value || "—"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-600 font-bold uppercase block">Próximo Passo</span>
                    <span className="font-medium text-slate-800">{m.next_small_step || "—"}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Form to add indicator */}
          <Card className="border-slate-200 bg-white rounded-3xl p-5 sm:p-6 space-y-4">
            <CardHeader className="p-0 pb-2">
              <CardTitle className="text-base font-bold text-slate-900">
                Cadastrar Novo Indicador BA-IACC
              </CardTitle>
            </CardHeader>
            <form onSubmit={handleSaveMetric} className="space-y-3">
              <input type="hidden" name="program_id" value={programs[0]?.id || ""} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Área temática</Label>
                  <Input name="area_name" required placeholder="Ex: Trabalho, Consigo" className="rounded-xl h-10 text-xs" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Indicador observável</Label>
                  <Input name="observable_indicator" required placeholder="Ex: Tarefas iniciadas sem revisar tudo" className="rounded-xl h-10 text-xs" />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Direção flexível</Label>
                <Input name="flexible_direction" placeholder="Ex: Agir por prioridade, não por urgência" className="rounded-xl h-10 text-xs" />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Linha base</Label>
                  <Input name="baseline_value" placeholder="Ex: 1x/semana" className="rounded-xl h-10 text-xs" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Valor atual</Label>
                  <Input name="current_value" placeholder="Ex: 3x/semana" className="rounded-xl h-10 text-xs" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Próximo micro-passo</Label>
                  <Input name="next_small_step" placeholder="Ex: Manter 3x" className="rounded-xl h-10 text-xs" />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button type="submit" disabled={isSavingMetric} className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs h-10 px-5">
                  {isSavingMetric ? "Salvando..." : "Adicionar Indicador"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Tab: REVISÕES SEMANAIS */}
      {activeTab === "revisoes" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Revisões Submetidas pelo Paciente
            </h2>
            <span className="text-xs text-slate-400">{reviews.length} revisões</span>
          </div>

          {reviews.length === 0 ? (
            <Card className="border-slate-200 bg-white rounded-2xl p-8 text-center text-slate-400">
              <p className="text-xs">O paciente ainda não preencheu nenhuma revisão semanal.</p>
            </Card>
          ) : (
            reviews.map((r: WeeklyReviewRow) => (
              <Card key={r.id} className="border-slate-200 bg-white rounded-3xl p-5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="font-bold text-sm text-slate-800">
                    Semana de {new Date(r.week_start).toLocaleDateString("pt-BR")}
                  </span>
                  <Badge variant="outline" className="text-[10px] text-slate-500">
                    {new Date(r.created_at).toLocaleDateString("pt-BR")}
                  </Badge>
                </div>
                <div className="space-y-2 text-xs text-slate-700">
                  <p>
                    <strong className="text-slate-900 block mb-0.5">1. Menor ganho reconhecido:</strong>
                    {r.smallest_gain}
                  </p>
                  <p>
                    <strong className="text-slate-900 block mb-0.5">2. Situação de flexibilidade:</strong>
                    {r.flexible_situation}
                  </p>
                  <p>
                    <strong className="text-slate-900 block mb-0.5">3. O que aumentou domínio/prazer:</strong>
                    {r.increased_domain_or_pleasure}
                  </p>
                  <p>
                    <strong className="text-slate-900 block mb-0.5">4. Ponto para análise funcional na sessão:</strong>
                    {r.high_anxiety_analysis}
                  </p>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Tab: NOTAS CLÍNICAS CONFIDENCIAIS */}
      {activeTab === "notas" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-indigo-600" />
              Notas Clínicas Confidenciais (Acesso Exclusivo do Terapeuta)
            </h2>
          </div>

          <div className="p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-xs text-indigo-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>
              Estas anotações são confidenciais do profissional. Pacientes e administradores não têm permissão técnica de leitura.
            </span>
          </div>

          <form onSubmit={handleSaveNote} className="space-y-3 p-4 sm:p-5 rounded-3xl bg-white border border-slate-200 shadow-xs">
            <Label htmlFor="noteContent" className="text-xs font-semibold text-slate-700">
              Adicionar nova nota ou evolução clínica
            </Label>
            <Textarea
              id="noteContent"
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Descreva hipóteses diagnósticas funcionais, observações da sessão ou conduta planejada..."
              className="min-h-[100px] text-xs bg-slate-50 border-slate-200 rounded-xl"
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isSavingNote || !noteContent.trim()}
                className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs h-10 px-5 text-white"
              >
                {isSavingNote ? "Salvando..." : "Salvar Nota Confidencial"}
              </Button>
            </div>
          </form>

          {/* Notes list */}
          <div className="space-y-3 pt-2">
            {notes.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">Nenhuma nota gravada ainda.</p>
            ) : (
              notes.map((n: ProfessionalNoteRow) => (
                <div key={n.id} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Evolução clínica</span>
                    <span>{new Date(n.created_at).toLocaleString("pt-BR")}</span>
                  </div>
                  <p className="text-slate-800 whitespace-pre-line leading-relaxed">{n.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
