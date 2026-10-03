import { requireRole } from "@/lib/auth/profile";
import { getAdminPlansAndSubscriptions } from "@/lib/domain/admin";
import { PlanosView } from "./planos-view";

export const metadata = {
  title: "Planos e Assinaturas — Administração Lumina",
  description: "Gerenciamento de planos comerciais e assinaturas de clínicas.",
};

export default async function AdminPlanosPage() {
  await requireRole("admin");
  const data = await getAdminPlansAndSubscriptions();

  return <PlanosView plans={data.plans} subscriptions={data.subscriptions} />;
}
