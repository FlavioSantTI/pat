"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "cn";
import { Input } from "@/components/ui/input";
import {
  createPatientAreaAction,
  archivePatientAreaAction,
  updatePatientAreaAction,
  deletePatientAreaAction,
} from "@/lib/domain/patient-actions";
import { ArrowLeft, Plus, Folder, Archive, Edit2, Trash2, Check, X } from "lucide-react";
import { toast } from "sonner";

export type PatientArea = {
  id: string;
  name: string;
  icon?: string | null;
  active?: boolean;
};

export function AreasView({ areas }: { areas: PatientArea[] }) {
  const [newAreaName, setNewAreaName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAreaName.trim()) return;

    setIsAdding(true);
    try {
      const res = await createPatientAreaAction(newAreaName.trim());
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Área pessoal criada!");
        setNewAreaName("");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro ao criar área.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleStartEdit = (area: PatientArea) => {
    setEditingId(area.id);
    setEditingName(area.name);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editingName.trim()) return;
    try {
      const res = await updatePatientAreaAction(id, editingName.trim());
      if (res?.error) toast.error(res.error);
      else {
        toast.success("Área atualizada!");
        setEditingId(null);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro ao atualizar.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja excluir permanentemente esta área?")) return;
    try {
      const res = await deletePatientAreaAction(id);
      if (res?.error) toast.error(res.error);
      else toast.info("Área excluída com sucesso.");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro ao excluir.");
    }
  };

  const handleArchive = async (id: string) => {
    if (!confirm("Deseja arquivar esta área?")) return;
    try {
      const res = await archivePatientAreaAction(id);
      if (res?.error) toast.error(res.error);
      else toast.info("Área arquivada.");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro ao arquivar.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/perfil"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "text-slate-500 -ml-2 rounded-xl text-xs",
          )}
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Voltar para Perfil
        </Link>
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Minhas Áreas de Vida
        </h1>
        <p className="text-xs text-slate-500 max-w-lg">
          Personalize as áreas temáticas que fazem sentido para o seu momento (Ex: Trabalho, Família, Autocuidado).
        </p>
      </div>

      {/* Form to create personal area */}
      <form
        onSubmit={handleAdd}
        className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3"
      >
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Criar nova área
        </h3>
        <div className="flex gap-2">
          <Input
            value={newAreaName}
            onChange={(e) => setNewAreaName(e.target.value)}
            placeholder="Nome da área (Ex: Leitura, Hobbies, Sono)"
            className="rounded-xl border-slate-200 text-xs h-10"
          />
          <Button
            type="submit"
            disabled={isAdding || !newAreaName.trim()}
            className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs h-10 px-4 shrink-0 shadow-xs"
          >
            {isAdding ? "Salvando..." : <Plus className="w-4 h-4" />}
          </Button>
        </div>
      </form>

      {/* Areas list */}
      <div className="space-y-2.5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
          Áreas ativas ({areas.length})
        </h2>

        {areas.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">
            Nenhuma área pessoal cadastrada.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {areas.map((area) => (
              <div
                key={area.id}
                className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between"
              >
                {editingId === area.id ? (
                  <div className="flex items-center gap-2 w-full">
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="rounded-xl border-slate-200 text-xs h-8"
                      autoFocus
                    />
                    <Button
                      size="sm"
                      onClick={() => handleSaveEdit(area.id)}
                      className="h-8 w-8 p-0 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                      title="Salvar alteração"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingId(null)}
                      className="h-8 w-8 p-0 text-slate-400 rounded-lg"
                      title="Cancelar"
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                        <Folder className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-semibold text-slate-800">
                        {area.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStartEdit(area)}
                        className="h-8 w-8 p-0 text-slate-400 hover:text-indigo-600 rounded-lg"
                        title="Editar nome"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleArchive(area.id)}
                        className="h-8 w-8 p-0 text-slate-400 hover:text-amber-600 rounded-lg"
                        title="Arquivar área"
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(area.id)}
                        className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 rounded-lg"
                        title="Excluir permanentemente"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

