"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Timer, Sparkles } from "lucide-react";
import { FOCUS_TIMER_PRESETS } from "@/lib/domain/assignment-status";

interface FocusTimerProps {
  onTimeUpdate?: (data: {
    enabled: boolean;
    minutes: number;
    elapsedSeconds: number;
  }) => void;
}

export function FocusTimer({ onTimeUpdate }: FocusTimerProps) {
  const [enabled, setEnabled] = useState(false);
  const [selectedMinutes, setSelectedMinutes] = useState<number>(10);
  const [customMinutes, setCustomMinutes] = useState<string>("");
  const [isCustom, setIsCustom] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(10 * 60);
  const [isActive, setIsActive] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentMinutes = isCustom ? Number(customMinutes) || 10 : selectedMinutes;

  const handleSelectPreset = (preset: number) => {
    setIsCustom(false);
    setSelectedMinutes(preset);
    setIsActive(false);
    setSecondsRemaining(preset * 60);
    setElapsedSeconds(0);
  };

  const handleSelectCustom = () => {
    setIsCustom(true);
    const mins = Number(customMinutes) || 10;
    setIsActive(false);
    setSecondsRemaining(mins * 60);
    setElapsedSeconds(0);
  };

  const handleCustomMinutesChange = (value: string) => {
    setCustomMinutes(value);
    const mins = Number(value) || 10;
    setIsActive(false);
    setSecondsRemaining(mins * 60);
    setElapsedSeconds(0);
  };

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            setIsActive(false);
            return 0;
          }
          return prev - 1;
        });
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive]);

  const notifyUpdate = useCallback(() => {
    onTimeUpdate?.({
      enabled,
      minutes: currentMinutes,
      elapsedSeconds,
    });
  }, [enabled, currentMinutes, elapsedSeconds, onTimeUpdate]);

  useEffect(() => {
    notifyUpdate();
  }, [notifyUpdate]);

  const toggleTimer = () => {
    const nextState = !enabled;
    setEnabled(nextState);
    if (!nextState) {
      setIsActive(false);
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    setSecondsRemaining(currentMinutes * 60);
    setElapsedSeconds(0);
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const progressPercent = Math.max(
    0,
    Math.min(100, ((currentMinutes * 60 - secondsRemaining) / (currentMinutes * 60)) * 100),
  );

  return (
    <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Timer className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-800">Temporizador de foco</h4>
            <p className="text-[11px] text-slate-400">Opcional para apoiar a presença no início</p>
          </div>
        </div>

        <button
          type="button"
          onClick={toggleTimer}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
            enabled ? "bg-indigo-600" : "bg-slate-200"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
              enabled ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {enabled && (
        <div className="space-y-4 pt-2 border-t border-slate-100 animate-in fade-in-50 duration-200">
          <div className="flex flex-wrap gap-1.5 items-center">
            {FOCUS_TIMER_PRESETS.map((preset) => (
              <Button
                key={preset}
                type="button"
                variant={!isCustom && selectedMinutes === preset ? "default" : "outline"}
                size="sm"
                onClick={() => handleSelectPreset(preset)}
                className={`h-7 px-2.5 rounded-lg text-xs font-medium ${
                  !isCustom && selectedMinutes === preset
                    ? "bg-indigo-600 text-white"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {preset} min
              </Button>
            ))}

            <Button
              type="button"
              variant={isCustom ? "default" : "outline"}
              size="sm"
              onClick={handleSelectCustom}
              className={`h-7 px-2.5 rounded-lg text-xs font-medium ${
                isCustom
                  ? "bg-indigo-600 text-white"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              Outro
            </Button>

            {isCustom && (
              <input
                type="number"
                min="1"
                max="120"
                value={customMinutes}
                onChange={(e) => handleCustomMinutesChange(e.target.value)}
                placeholder="Ex: 8"
                className="w-16 h-7 text-xs px-2 border border-slate-200 rounded-lg text-center font-medium focus:outline-indigo-500"
              />
            )}
          </div>

          {/* Digital counter and progress */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 text-center space-y-3">
            <div className="text-3xl sm:text-4xl font-mono font-bold tracking-tight text-slate-900">
              {formatTime(secondsRemaining)}
            </div>

            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-full transition-all duration-500 ease-out rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-center gap-2 pt-1">
              <Button
                type="button"
                size="sm"
                onClick={() => setIsActive(!isActive)}
                className={`rounded-xl px-4 h-9 font-medium text-xs shadow-xs ${
                  isActive
                    ? "bg-amber-600 hover:bg-amber-700 text-white"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white"
                }`}
              >
                {isActive ? (
                  <>
                    <Pause className="w-3.5 h-3.5 mr-1.5" /> Pausar
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 mr-1.5" /> Iniciar foco
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={resetTimer}
                className="rounded-xl h-9 text-xs border-slate-200 text-slate-600 hover:bg-white"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </Button>
            </div>

            {secondsRemaining === 0 && (
              <p className="text-xs text-emerald-600 font-semibold flex items-center justify-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Tempo concluído. Você foi até onde foi viável!
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
