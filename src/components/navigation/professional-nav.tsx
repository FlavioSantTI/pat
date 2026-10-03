"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Users, BookOpen, ClipboardCheck } from "lucide-react";
import { UserMenu } from "./user-menu";
import { Badge } from "@/components/ui/badge";
import type { Profile } from "@/types";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Pacientes", icon: Users },
  { href: "/programas", label: "Programas & Atividades", icon: BookOpen },
  { href: "/revisoes", label: "Revisões Semanais", icon: ClipboardCheck },
];

export function ProfessionalNav({ profile }: { profile: Profile }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-slate-900">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-base tracking-tight font-bold">Lumina</span>
            <Badge variant="secondary" className="text-[10px] uppercase font-semibold tracking-wider bg-indigo-50 text-indigo-700 hover:bg-indigo-50">
              Clínico
            </Badge>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    isActive
                      ? "bg-slate-100 text-slate-900 font-semibold"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-medium"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <UserMenu profile={profile} />
      </div>

      {/* Mobile submenu for professional */}
      <div className="flex md:hidden border-t border-slate-100 bg-slate-50/80 px-4 py-2 gap-2 overflow-x-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs whitespace-nowrap ${
                isActive
                  ? "bg-white text-indigo-600 font-semibold shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
}
