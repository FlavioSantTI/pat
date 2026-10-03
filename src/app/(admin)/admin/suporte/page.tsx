import { requireRole } from "@/lib/auth/profile";
import { getAdminSupportAndAudit } from "@/lib/domain/admin";
import { SuporteView } from "./suporte-view";

export const metadata = {
  title: "Suporte e Logs de Auditoria — Administração Lumina",
  description: "Atendimento técnico operacional e registros de auditoria.",
};

export default async function AdminSuportePage() {
  await requireRole("admin");
  const data = await getAdminSupportAndAudit();

  return <SuporteView tickets={data.tickets} auditLogs={data.auditLogs} />;
}
