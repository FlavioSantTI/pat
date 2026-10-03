import { requireRole } from "@/lib/auth/profile";
import { ProfessionalNav } from "@/components/navigation/professional-nav";

export default async function ProfessionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireRole("professional");

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/60">
      <ProfessionalNav profile={profile} />
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
