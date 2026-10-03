"use client";

import { logoutAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { LogOut, User as UserIcon } from "lucide-react";
import type { Profile } from "@/types";

export function UserMenu({ profile }: { profile: Profile }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
          <UserIcon className="w-4 h-4" />
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-xs font-semibold text-slate-800 leading-tight">
            {profile.displayName}
          </p>
          <p className="text-[10px] text-slate-500 capitalize leading-tight">
            {profile.role === "patient"
              ? "Paciente"
              : profile.role === "professional"
                ? "Terapeuta"
                : "Administrador"}
          </p>
        </div>
      </div>

      <form action={logoutAction}>
        <Button
          type="submit"
          variant="ghost"
          size="sm"
          className="text-slate-500 hover:text-rose-600 hover:bg-rose-50 h-8 px-2.5"
          title="Sair da conta"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden md:inline ml-1 text-xs">Sair</span>
        </Button>
      </form>
    </div>
  );
}
