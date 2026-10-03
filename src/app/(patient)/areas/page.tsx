import { requireRole } from "@/lib/auth/profile";
import { getPatientAreas } from "@/lib/domain/patient";
import { AreasView } from "./areas-view";

export const metadata = {
  title: "Minhas Áreas — Lumina",
  description: "Gerenciamento de áreas temáticas pessoais.",
};

export default async function AreasPage() {
  const profile = await requireRole("patient");
  const areas = await getPatientAreas(profile.patientId!);
  return <AreasView areas={areas} />;
}
