import { requireRole } from "@/lib/auth/profile";
import { getAdminUsersAndOrganizations } from "@/lib/domain/admin";
import { UsuariosView } from "./usuarios-view";

export const metadata = {
  title: "Usuários e Organizações — Administração Lumina",
  description: "Gerenciamento de clínicas, profissionais e usuários.",
};

export default async function AdminUsuariosPage() {
  await requireRole("admin");
  const data = await getAdminUsersAndOrganizations();

  return (
    <UsuariosView
      organizations={data.organizations}
      users={data.users}
      professionals={data.professionals}
    />
  );
}
