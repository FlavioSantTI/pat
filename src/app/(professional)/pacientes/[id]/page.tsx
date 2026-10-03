import { requireRole } from "@/lib/auth/profile";
import {
  getPatientClinicalRecord,
  getProfessionalPrograms,
} from "@/lib/domain/professional";
import { notFound } from "next/navigation";
import { PatientRecordView } from "./patient-record-view";

export const metadata = {
  title: "Prontuário do Paciente — Lumina",
  description: "Acompanhamento clínico, D/P/A e notas confidenciais.",
};

export default async function PatientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await requireRole("professional");

  const [data, programs] = await Promise.all([
    getPatientClinicalRecord(profile.professionalId!, id),
    getProfessionalPrograms(profile.professionalId!),
  ]);

  if (!data) {
    notFound();
  }

  // Flatten available activities from therapist's programs
  const availableActivities = programs.flatMap((p) => p.activities ?? []);

  return (
    <PatientRecordView
      data={data}
      availableActivities={availableActivities}
      programs={programs}
    />
  );
}
