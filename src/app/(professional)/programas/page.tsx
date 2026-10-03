import { requireRole } from "@/lib/auth/profile";
import { getProfessionalPrograms } from "@/lib/domain/professional";
import { ProgramasView } from "./programas-view";

export const metadata = {
  title: "Programas e Atividades — Lumina",
  description: "Biblioteca de programas terapêuticos e atividades.",
};

export default async function ProgramasPage() {
  const profile = await requireRole("professional");
  const programs = await getProfessionalPrograms(profile.professionalId!);

  return <ProgramasView programs={programs} />;
}
