"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, CalendarDays, Target, User, Clock, ClipboardList } from "lucide-react";
import { UserMenu } from "./user-menu";
import type { Profile } from "@/types";

const NAV_ITEMS = [
  { href: "/hoje", label: "Hoje & D/P/A", icon: Clock },
  { href: "/agenda", label: "Agenda & Atribuição", icon: CalendarDays },
  { href: "/progresso", label: "Indicadores (BA-IACC)", icon: Target },
  { href: "/revisao", label: "Revisão", icon: ClipboardList },
  { href: "/perfil", label: "Perfil", icon: User },
];

export function PatientNav({ profile }: { profile: Profile }) {
  const pathname = usePathname();

  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-30 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/hoje" className="flex items-center gap-2 font-semibold text-slate-900">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-base tracking-tight font-bold">Lumina</span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <UserMenu profile={profile} />
        </div>
      </header>

      {/* Mobile-first Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200/80 bg-white/95 backdrop-blur-md pb-safe">
        <div className="max-w-md mx-auto grid grid-cols-5 h-16">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 transition-colors px-1 ${
                  isActive
                    ? "text-indigo-600 font-semibold"
                    : "text-slate-400 hover:text-slate-600 font-medium"
                }`}
              >
                <div
                  className={`p-1 rounded-xl transition-all ${
                    isActive ? "bg-indigo-50 text-indigo-600" : ""
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] leading-tight text-center line-clamp-1">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

