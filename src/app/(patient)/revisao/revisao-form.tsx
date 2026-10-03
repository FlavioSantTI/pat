"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { submitWeeklyReviewAction } from "@/lib/domain/patient-actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "cn";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, CheckCircle2, ClipboardCheck } from "lucide-react";
import { toast } from "sonner";

export function RevisaoForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    try {
      const res = await submitWeeklyReviewAction(formData);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Revisão semanal registrada com sucesso!");
        router.push("/progresso");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar revisão.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/progresso"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "text-slate-500 -ml-2 rounded-xl text-xs",
          )}
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Voltar para Progresso
        </Link>
      </div>

      <Card className="border-slate-200 bg-white shadow-xs rounded-3xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-indigo-50/30 p-5 sm:p-6 border-b border-slate-100">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-1">
            <ClipboardCheck className="w-5 h-5" />
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold text-slate-900">
            Revisão Semanal de Atividades
          </CardTitle>
          <CardDescription className="text-xs text-slate-500 leading-relaxed">
            As quatro perguntas reflexivas para sintetizar a sua semana e preparar os pontos focais
            da sua próxima sessão terapêutica.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-5 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Pergunta 1 */}
            <div className="space-y-2">
              <Label htmlFor="smallest_gain" className="text-sm font-semibold text-slate-900 block">
                1. O menor ganho que quero reconhecer esta semana foi:
              </Label>
              <Textarea
                id="smallest_gain"
                name="smallest_gain"
                required
                placeholder="Ex: Mesmo desmotivado na terça, abri o computador e executei 10 minutos de foco."
                className="min-h-[80px] text-xs bg-slate-50/50 border-slate-200 rounded-xl resize-none"
              />
            </div>

            {/* Pergunta 2 */}
            <div className="space-y-2">
              <Label htmlFor="flexible_situation" className="text-sm font-semibold text-slate-900 block">
                2. Uma situação em que fui flexível, mesmo ansioso(a) ou triste:
              </Label>
              <Textarea
                id="flexible_situation"
                name="flexible_situation"
                required
                placeholder="Ex: Em vez de desistir de almoçar pela pressa, escolhi uma refeição simples sem autocobrança."
                className="min-h-[80px] text-xs bg-slate-50/50 border-slate-200 rounded-xl resize-none"
              />
            </div>

            {/* Pergunta 3 */}
            <div className="space-y-2">
              <Label htmlFor="increased_domain_or_pleasure" className="text-sm font-semibold text-slate-900 block">
                3. O que aumentou meu domínio ou prazer?
              </Label>
              <Textarea
                id="increased_domain_or_pleasure"
                name="increased_domain_or_pleasure"
                required
                placeholder="Ex: Concluir uma pendência logo cedo me trouxe sensação de alívio e controle."
                className="min-h-[80px] text-xs bg-slate-50/50 border-slate-200 rounded-xl resize-none"
              />
            </div>

            {/* Pergunta 4 */}
            <div className="space-y-2">
              <Label htmlFor="high_anxiety_analysis" className="text-sm font-semibold text-slate-900 block">
                4. O que manteve a ansiedade alta e merece análise funcional na sessão?
              </Label>
              <Textarea
                id="high_anxiety_analysis"
                name="high_anxiety_analysis"
                required
                placeholder="Ex: Sentir que outras pessoas estavam esperando minha resposta me travou na quinta-feira."
                className="min-h-[80px] text-xs bg-slate-50/50 border-slate-200 rounded-xl resize-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <Link
                href="/progresso"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "rounded-xl border-slate-200 text-xs px-4",
                )}
              >
                Cancelar
              </Link>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs px-6 shadow-xs"
              >
                {isSubmitting ? (
                  "Salvando..."
                ) : (
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Salvar Revisão Semanal
                  </span>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
