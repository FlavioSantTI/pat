"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, Users, CreditCard, LifeBuoy, AlertTriangle } from "lucide-react";
import { UserMenu } from "./user-menu";
import { Badge } from "@/components/ui/badge";
import type { Profile } from "@/types";

const NAV_ITEMS = [
  { href: "/admin", label: "Operação", icon: Shield },
  { href: "/admin/usuarios", label: "Usuários & Clínicas", icon: Users },
  { href: "/admin/planos", label: "Planos & Assinaturas", icon: CreditCard },
  { href: "/admin/suporte", label: "Suporte & Logs", icon: LifeBuoy },
];

export function AdminNav({ profile }: { profile: Profile }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="flex items-center gap-2 font-bold text-slate-900">
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <Shield className="w-4 h-4" />
            </div>
            <span className="text-base tracking-tight font-bold">Lumina</span>
            <Badge variant="outline" className="text-[10px] uppercase font-semibold tracking-wider border-amber-300 bg-amber-50/50 text-amber-800">
              Operacional
            </Badge>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
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

      <div className="bg-amber-50/80 border-t border-b border-amber-200/60 px-4 py-1.5 text-center text-xs text-amber-800 flex items-center justify-center gap-2">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        <span>
          <strong>Privacidade Terapêutica Ativa:</strong> Perfil restrito à gestão de contas, planos e suporte. O banco bloqueia tecnicamente acesso a dados clínicos.
        </span>
      </div>
    </header>
  );
}
