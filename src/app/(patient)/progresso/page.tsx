import { requireRole } from "@/lib/auth/profile";
import {
  getPatientProgressMetrics,
  getPatientGains,
  getPatientReviews,
} from "@/lib/domain/patient";
import { ProgressoView } from "./progresso-view";

export const metadata = {
  title: "Progresso — Lumina",
  description: "Indicadores terapêuticos e mural de pequenos ganhos.",
};

export default async function ProgressoPage() {
  const profile = await requireRole("patient");

  const [metrics, gains, reviews] = await Promise.all([
    getPatientProgressMetrics(profile.patientId!),
    getPatientGains(profile.patientId!),
    getPatientReviews(profile.patientId!),
  ]);

  return <ProgressoView metrics={metrics} gains={gains} reviews={reviews} />;
}
