"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTimerContext } from "@/providers/timer-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { BellRing, Pause, Play, X, ExternalLink, Timer, Sparkles } from "lucide-react";

export function ActiveTimerWidget() {
  const { timer, secondsRemaining, pauseTimer, resumeTimer, stopTimer, dismissAlarm } =
    useTimerContext();
  const pathname = usePathname();
  const router = useRouter();

  if (!timer) return null;

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleGoToActivity = () => {
    const targetPath = `/atividade/${timer.assignmentId}`;
    if (timer.isRinging) {
      dismissAlarm();
    }
    if (pathname !== targetPath) {
      router.push(targetPath);
    }
  };

  return (
    <>
      {/* Alarm Modal when time expires */}
      <Dialog open={timer.isRinging} onOpenChange={(open) => !open && dismissAlarm()}>
        <DialogContent className="sm:max-w-md bg-white border-amber-200 shadow-2xl rounded-3xl p-6">
          <DialogHeader className="text-center items-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-amber-100 border-4 border-amber-200 flex items-center justify-center text-amber-600 animate-bounce">
              <BellRing className="w-8 h-8" />
            </div>
            <DialogTitle className="text-xl font-bold text-slate-900">
              ⏰ Tempo de Atividade Concluído!
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-600 font-medium">
              O tempo configurado de <strong className="text-indigo-600">{timer.durationMinutes} minutos</strong> para a atividade <strong className="text-slate-900">"{timer.activityTitle}"</strong> decorreu!
            </DialogDescription>
          </DialogHeader>

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900 text-center space-y-1">
            <p className="font-semibold flex items-center justify-center gap-1">
              <Sparkles className="w-4 h-4 text-amber-600" />
              Excelente trabalho!
            </p>
            <p>Clique abaixo para desligar o alarme e registrar sua avaliação D/P/A.</p>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
            <Button
              onClick={handleGoToActivity}
              className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md"
            >
              <BellRing className="w-4 h-4 mr-2" />
              Desligar Alarme e Ir para Atividade
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Floating Bar when timer is active and not ringing */}
      {!timer.isRinging && (
        <div className="fixed bottom-16 md:bottom-4 left-4 right-4 max-w-md mx-auto z-40 animate-in slide-in-from-bottom-5 duration-300">
          <div className="p-3 bg-slate-900/95 backdrop-blur-md text-white rounded-2xl shadow-xl border border-slate-700 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400 shrink-0">
                <Timer className="w-4 h-4 animate-pulse" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate leading-tight">
                  {timer.activityTitle}
                </p>
                <p className="text-[11px] font-mono text-indigo-300 font-bold">
                  {formatTime(secondsRemaining)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={timer.isRunning ? pauseTimer : resumeTimer}
                className="h-8 w-8 p-0 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
                title={timer.isRunning ? "Pausar" : "Continuar"}
              >
                {timer.isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>

              <Link
                href={`/atividade/${timer.assignmentId}`}
                className="h-8 px-2.5 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1 transition-colors"
              >
                <span>Ver</span>
                <ExternalLink className="w-3 h-3" />
              </Link>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={stopTimer}
                className="h-8 w-8 p-0 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                title="Cancelar Temporizador"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
