import { requireRole } from "@/lib/auth/profile";
import { RevisaoForm } from "./revisao-form";

export const metadata = {
  title: "Revisão Semanal — Lumina",
  description: "Síntese funcional semanal de atividades e ganhos.",
};

export default async function RevisaoPage() {
  await requireRole("patient");
  return <RevisaoForm />;
}
