"use client";

import { WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <div className="max-w-md w-full p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs text-center space-y-5">
        <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center mx-auto">
          <WifiOff className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Você está sem conexão
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            O Lumina continua funcionando em modo offline para o que você já carregou. Seus novos registros serão sincronizados com segurança assim que a conexão retornar.
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600 text-left space-y-1">
          <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider block">
            Dica Terapêutica
          </span>
          <p className="text-[11px] leading-relaxed">
            Se estiver no meio de uma atividade com temporizador, você pode continuar sem pressa. A conexão não interfere no seu foco.
          </p>
        </div>

        <Button
          type="button"
          onClick={() => window.location.reload()}
          className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-11 font-medium"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Tentar Reconectar
        </Button>
      </div>
    </div>
  );
}
