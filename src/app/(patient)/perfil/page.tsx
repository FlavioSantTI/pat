import { requireRole } from "@/lib/auth/profile";
import { logoutAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { User, Folder, ClipboardList, Shield, LogOut, Sparkles } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Perfil — Lumina",
  description: "Configurações da sua conta e preferências terapêuticas.",
};

export default async function PerfilPage() {
  const profile = await requireRole("patient");

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Meu Espaço
        </h1>
        <p className="text-xs text-slate-500">
          Informações da sua conta e atalhos para suas preferências.
        </p>
      </div>

      {/* User info card */}
      <Card className="border-slate-200 bg-white shadow-xs rounded-3xl overflow-hidden">
        <CardContent className="p-5 sm:p-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <User className="w-7 h-7" />
          </div>
          <div className="space-y-0.5">
            <h2 className="text-lg font-bold text-slate-900">{profile.displayName}</h2>
            <p className="text-xs text-slate-500">{profile.email}</p>
            <span className="inline-block mt-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
              Acompanhamento Ativo
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Shortcuts */}
      <div className="space-y-2.5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
          Atalhos e Ferramentas
        </h2>

        <div className="grid grid-cols-1 gap-2.5">
          <Link
            href="/areas"
            className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Folder className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Minhas Áreas de Vida</p>
                <p className="text-[11px] text-slate-500">Gerencie áreas pessoais como Trabalho, Social, Saúde</p>
              </div>
            </div>
            <span className="text-xs font-medium text-indigo-600">Configurar →</span>
          </Link>

          <Link
            href="/revisao"
            className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <ClipboardList className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Revisão Semanal</p>
                <p className="text-[11px] text-slate-500">Faça sua síntese das quatro perguntas da semana</p>
              </div>
            </div>
            <span className="text-xs font-medium text-indigo-600">Acessar →</span>
          </Link>

          <Link
            href="/progresso"
            className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Mural de Pequenos Ganhos</p>
                <p className="text-[11px] text-slate-500">Consulte seus registros qualitativos de progresso</p>
              </div>
            </div>
            <span className="text-xs font-medium text-amber-700">Ver mural →</span>
          </Link>
        </div>
      </div>

      {/* Security & Privacy notice */}
      <div className="p-4 rounded-2xl bg-slate-100/70 border border-slate-200/80 text-xs text-slate-600 space-y-1">
        <div className="flex items-center gap-1.5 font-bold text-slate-800">
          <Shield className="w-4 h-4 text-indigo-600" />
          <span>Privacidade Garantida</span>
        </div>
        <p className="text-[11px] leading-relaxed">
          Seus registros reflexivos e avaliações D/P/A são compartilhados exclusivamente com seu terapeuta vinculado.
          O administrador da infraestrutura não possui acesso às suas anotações clínicas.
        </p>
      </div>

      {/* Logout button */}
      <form action={logoutAction} className="pt-2">
        <Button
          type="submit"
          variant="outline"
          className="w-full h-11 rounded-2xl border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-medium"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Encerrar sessão
        </Button>
      </form>
    </div>
  );
}
