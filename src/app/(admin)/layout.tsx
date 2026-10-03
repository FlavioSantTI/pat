import { requireRole } from "@/lib/auth/profile";
import { AdminNav } from "@/components/navigation/admin-nav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireRole("admin");

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/60">
      <AdminNav profile={profile} />
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
