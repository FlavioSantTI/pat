"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { playAlarmSound, stopAlarmSound } from "@/lib/audio/alarm";

interface TimerState {
  assignmentId: string;
  activityTitle: string;
  durationMinutes: number;
  endTime: number; // timestamp ms
  pausedRemainingSeconds: number | null;
  isRunning: boolean;
  isRinging: boolean;
}

interface TimerContextType {
  timer: TimerState | null;
  secondsRemaining: number;
  startTimer: (params: { assignmentId: string; activityTitle: string; durationMinutes: number }) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => void;
  dismissAlarm: () => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = "lumina_active_activity_timer";

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [timer, setTimer] = useState<TimerState | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);

  // Load initial state from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed: TimerState = JSON.parse(saved);
        if (parsed) {
          setTimer(parsed);
        }
      }
    } catch (e) {
      console.error("Erro ao carregar temporizador do localStorage:", e);
    }
  }, []);

  // Save state to localStorage whenever timer changes
  useEffect(() => {
    try {
      if (timer) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(timer));
      } else {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    } catch (e) {
      console.error("Erro ao salvar temporizador no localStorage:", e);
    }
  }, [timer]);

  // Main ticker interval
  useEffect(() => {
    if (!timer) {
      setSecondsRemaining(0);
      return;
    }

    if (timer.isRinging) {
      setSecondsRemaining(0);
      return;
    }

    if (!timer.isRunning) {
      if (timer.pausedRemainingSeconds !== null) {
        setSecondsRemaining(timer.pausedRemainingSeconds);
      }
      return;
    }

    const updateRemaining = () => {
      const now = Date.now();
      const diff = Math.max(0, Math.ceil((timer.endTime - now) / 1000));
      setSecondsRemaining(diff);

      if (diff <= 0) {
        // Time is up! Trigger alarm!
        setTimer((prev) => (prev ? { ...prev, isRunning: false, isRinging: true } : null));
        playAlarmSound();
      }
    };

    updateRemaining();
    const interval = setInterval(updateRemaining, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const startTimer = useCallback(({ assignmentId, activityTitle, durationMinutes }: { assignmentId: string; activityTitle: string; durationMinutes: number }) => {
    stopAlarmSound();
    const durationMs = durationMinutes * 60 * 1000;
    const endTime = Date.now() + durationMs;

    setTimer({
      assignmentId,
      activityTitle,
      durationMinutes,
      endTime,
      pausedRemainingSeconds: null,
      isRunning: true,
      isRinging: false,
    });
  }, []);

  const pauseTimer = useCallback(() => {
    setTimer((prev) => {
      if (!prev || !prev.isRunning) return prev;
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((prev.endTime - now) / 1000));
      return {
        ...prev,
        isRunning: false,
        pausedRemainingSeconds: remaining,
      };
    });
  }, []);

  const resumeTimer = useCallback(() => {
    setTimer((prev) => {
      if (!prev || prev.isRunning || prev.pausedRemainingSeconds === null) return prev;
      const newEndTime = Date.now() + prev.pausedRemainingSeconds * 1000;
      return {
        ...prev,
        isRunning: true,
        endTime: newEndTime,
        pausedRemainingSeconds: null,
      };
    });
  }, []);

  const stopTimer = useCallback(() => {
    stopAlarmSound();
    setTimer(null);
  }, []);

  const dismissAlarm = useCallback(() => {
    stopAlarmSound();
    setTimer(null);
  }, []);

  return (
    <TimerContext.Provider
      value={{
        timer,
        secondsRemaining,
        startTimer,
        pauseTimer,
        resumeTimer,
        stopTimer,
        dismissAlarm,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
}

export function useTimerContext() {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error("useTimerContext deve ser usado dentro de um TimerProvider");
  }
  return context;
}
