"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ActivityCard } from "@/components/patient/activity-card";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";
import { PERIOD_LABELS } from "@/types";
import type { PatientActivityItem } from "@/lib/domain/patient";
import { PatientNewAssignmentDialog } from "@/components/patient/new-assignment-dialog";

type ViewMode = "dia" | "semana" | "mes";


export function AgendaView({ initialItems }: { initialItems: PatientActivityItem[] }) {
  const [viewMode, setViewMode] = useState<ViewMode>("dia");
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  const dateStr = currentDate.toISOString().slice(0, 10);

  const prev = () => {
    const d = new Date(currentDate);
    if (viewMode === "dia") d.setDate(d.getDate() - 1);
    else if (viewMode === "semana") d.setDate(d.getDate() - 7);
    else d.setMonth(d.getMonth() - 1);
    setCurrentDate(d);
  };

  const next = () => {
    const d = new Date(currentDate);
    if (viewMode === "dia") d.setDate(d.getDate() + 1);
    else if (viewMode === "semana") d.setDate(d.getDate() + 7);
    else d.setMonth(d.getMonth() + 1);
    setCurrentDate(d);
  };

  const goToday = () => {
    setCurrentDate(new Date());
  };

  // Day filter
  const dayItems = initialItems.filter((i) => i.scheduledDate === dateStr);

  // Week calculation (Monday to Sunday)
  const getWeekDays = (base: Date) => {
    const curr = new Date(base);
    const day = curr.getDay();
    const diff = curr.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(curr.setDate(diff));
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const nextDay = new Date(monday);
      nextDay.setDate(monday.getDate() + i);
      days.push(nextDay);
    }
    return days;
  };

  const weekDays = getWeekDays(currentDate);

  // Month days
  const getMonthDays = (base: Date) => {
    const year = base.getFullYear();
    const month = base.getMonth();
    const lastDay = new Date(year, month + 1, 0);
    const days: Date[] = [];
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const monthDays = getMonthDays(currentDate);

  return (
    <div className="space-y-6">
      {/* Title & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Agenda Terapêutica
          </h1>
          <p className="text-xs text-slate-500">
            Visão flexível e adaptativa das suas atividades programadas.
          </p>
        </div>

        {/* View Mode Segmented Control & New Assignment Button */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200/80">
            {(["dia", "semana", "mes"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                  viewMode === mode
                    ? "bg-white text-indigo-600 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <PatientNewAssignmentDialog defaultDate={dateStr} buttonLabel="Nova Atribuição" variant="default" />
        </div>
      </div>


      {/* Date Navigation Bar */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <Button
          variant="ghost"
          size="sm"
          onClick={prev}
          className="h-8 w-8 p-0 rounded-xl text-slate-600"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-800 capitalize">
            {viewMode === "dia" &&
              new Intl.DateTimeFormat("pt-BR", {
                weekday: "short",
                day: "numeric",
                month: "long",
              }).format(currentDate)}

            {viewMode === "semana" &&
              `Semana de ${weekDays[0].toLocaleDateString("pt-BR", { day: "numeric", month: "short" })} a ${weekDays[6].toLocaleDateString("pt-BR", { day: "numeric", month: "short" })}`}

            {viewMode === "mes" &&
              new Intl.DateTimeFormat("pt-BR", {
                month: "long",
                year: "numeric",
              }).format(currentDate)}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={goToday}
            className="text-[11px] h-7 px-2.5 rounded-lg border-slate-200 text-slate-600 font-medium"
          >
            Hoje
          </Button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={next}
          className="h-8 w-8 p-0 rounded-xl text-slate-600"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* View: DIA */}
      {viewMode === "dia" && (
        <div className="space-y-3">
          {dayItems.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-white border border-slate-200/80 text-slate-400 space-y-2">
              <CalendarIcon className="w-8 h-8 text-slate-300 mx-auto stroke-1" />
              <p className="text-xs">Nenhuma atividade agendada para este dia.</p>
            </div>
          ) : (
            dayItems.map((item) => <ActivityCard key={item.id} item={item} />)
          )}
        </div>
      )}

      {/* View: SEMANA */}
      {viewMode === "semana" && (
        <div className="space-y-4">
          {weekDays.map((day) => {
            const dayIso = day.toISOString().slice(0, 10);
            const itemsForDay = initialItems.filter((i) => i.scheduledDate === dayIso);
            const isToday = dayIso === new Date().toISOString().slice(0, 10);

            return (
              <div
                key={dayIso}
                className={`p-4 rounded-2xl border transition-all ${
                  isToday
                    ? "bg-indigo-50/20 border-indigo-200"
                    : "bg-white border-slate-200/80"
                }`}
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 capitalize">
                      {day.toLocaleDateString("pt-BR", { weekday: "short" })}, {day.getDate()}
                    </span>
                    {isToday && (
                      <Badge className="bg-indigo-600 text-white text-[10px] py-0 px-2 rounded-md">
                        Hoje
                      </Badge>
                    )}
                  </div>

                  <span className="text-xs text-slate-400 font-medium">
                    {itemsForDay.length} atividade{itemsForDay.length !== 1 ? "s" : ""}
                  </span>
                </div>

                <div className="pt-3 space-y-2">
                  {itemsForDay.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">Livre de atividades.</p>
                  ) : (
                    itemsForDay.map((item) => (
                      <Link
                        key={item.id}
                        href={`/atividade/${item.id}`}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/60 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              item.status === "completed"
                                ? "bg-emerald-500"
                                : item.status === "started"
                                  ? "bg-indigo-500"
                                  : "bg-slate-400"
                            }`}
                          />
                          <span className="text-xs font-semibold text-slate-800 line-clamp-1">
                            {item.title}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 font-medium shrink-0">
                          {PERIOD_LABELS[item.period]}
                        </span>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View: MÊS (Visão Resumida) */}
      {viewMode === "mes" && (
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-400 pb-2">
            <span>D</span>
            <span>S</span>
            <span>T</span>
            <span>Q</span>
            <span>Q</span>
            <span>S</span>
            <span>S</span>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {monthDays.map((d) => {
              const dIso = d.toISOString().slice(0, 10);
              const itemsOnDay = initialItems.filter((i) => i.scheduledDate === dIso);
              const isToday = dIso === new Date().toISOString().slice(0, 10);
              const isSelected = dIso === dateStr;

              return (
                <button
                  key={dIso}
                  type="button"
                  onClick={() => {
                    setCurrentDate(d);
                    setViewMode("dia");
                  }}
                  className={`min-h-[52px] p-1 rounded-xl flex flex-col items-center justify-between text-xs border transition-all ${
                    isSelected
                      ? "border-indigo-600 bg-indigo-50 font-bold text-indigo-700"
                      : isToday
                        ? "border-indigo-300 bg-indigo-50/40 font-semibold text-indigo-900"
                        : "border-slate-100 hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <span>{d.getDate()}</span>
                  <div className="flex gap-0.5">
                    {itemsOnDay.slice(0, 3).map((item, idx) => (
                      <span
                        key={idx}
                        className={`w-1.5 h-1.5 rounded-full ${
                          item.status === "completed"
                            ? "bg-emerald-500"
                            : item.status === "started"
                              ? "bg-indigo-500"
                              : "bg-slate-400"
                        }`}
                      />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-2 flex items-center justify-center gap-4 text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Concluída
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500" /> Em andamento
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-400" /> Agendada
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
