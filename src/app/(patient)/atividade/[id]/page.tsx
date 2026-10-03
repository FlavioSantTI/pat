import { requireRole } from "@/lib/auth/profile";
import { getAssignmentDetails } from "@/lib/domain/patient";
import { notFound } from "next/navigation";
import { ActivityView } from "./activity-view";

export const metadata = {
  title: "Atividade — Lumina",
  description: "Detalhes e execução de atividade terapêutica.",
};

export default async function ActivityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await requireRole("patient");
  const item = await getAssignmentDetails(profile.patientId!, id);

  if (!item) {
    notFound();
  }

  return <ActivityView item={item} />;
}
