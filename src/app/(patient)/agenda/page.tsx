import { requireRole } from "@/lib/auth/profile";
import { getAgendaAssignments } from "@/lib/domain/patient";
import { AgendaView } from "./agenda-view";

export const metadata = {
  title: "Agenda — Lumina",
  description: "Visualização diária, semanal e mensal das atividades.",
};

export default async function AgendaPage() {
  const profile = await requireRole("patient");

  // Fetch 60 days around current date
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 10);
  const end = new Date(now.getFullYear(), now.getMonth() + 2, 0).toISOString().slice(0, 10);

  const items = await getAgendaAssignments(profile.patientId!, start, end);

  return <AgendaView initialItems={items} />;
}
