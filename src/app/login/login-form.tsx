"use client";

import { useActionState, useState } from "react";
import { loginAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn, Sparkles, User, Stethoscope, Shield } from "lucide-react";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, undefined);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleQuickLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("LuminaDev!2026");
  };

  return (
    <Card className="w-full max-w-md shadow-lg border-slate-200/80 bg-white">
      <CardHeader className="space-y-1 text-center pb-6">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-2">
          <Sparkles className="w-6 h-6" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
          Lumina
        </CardTitle>
        <CardDescription className="text-sm text-slate-500">
          Acompanhamento terapêutico e desenvolvimento de habilidades
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {state?.error && (
          <div className="p-3 text-sm rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-medium">
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-700 font-medium text-xs uppercase tracking-wider">
              E-mail
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu.email@exemplo.com"
              className="h-11 bg-slate-50/50 border-slate-200 focus-visible:ring-indigo-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-700 font-medium text-xs uppercase tracking-wider">
              Senha
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-11 bg-slate-50/50 border-slate-200 focus-visible:ring-indigo-500"
            />
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-base shadow-sm transition-all"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Acessando...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <LogIn className="w-4 h-4" />
                Entrar na plataforma
              </span>
            )}
          </Button>
        </form>

        <div className="pt-4 border-t border-slate-100">
          <p className="text-xs text-center font-medium text-slate-400 mb-2.5">
            Acesso rápido de demonstração (Seed)
          </p>
          <div className="grid grid-cols-3 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleQuickLogin("maria.paciente@lumina.dev")}
              className="h-auto py-2 px-2 flex flex-col items-center gap-1 text-[11px] font-normal border-slate-200 hover:bg-slate-50 text-slate-700"
            >
              <User className="w-3.5 h-3.5 text-emerald-600" />
              <span>Paciente</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleQuickLogin("ana.profissional@lumina.dev")}
              className="h-auto py-2 px-2 flex flex-col items-center gap-1 text-[11px] font-normal border-slate-200 hover:bg-slate-50 text-slate-700"
            >
              <Stethoscope className="w-3.5 h-3.5 text-indigo-600" />
              <span>Terapeuta</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleQuickLogin("admin.ficticio@lumina.dev")}
              className="h-auto py-2 px-2 flex flex-col items-center gap-1 text-[11px] font-normal border-slate-200 hover:bg-slate-50 text-slate-700"
            >
              <Shield className="w-3.5 h-3.5 text-amber-600" />
              <span>Admin</span>
            </Button>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0 justify-center">
        <p className="text-xs text-slate-400 text-center">
          Ambiente seguro com criptografia e privacidade RLS ponta a ponta.
        </p>
      </CardFooter>
    </Card>
  );
}
