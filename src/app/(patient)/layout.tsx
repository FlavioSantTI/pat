import { requireRole } from "@/lib/auth/profile";
import { PatientNav } from "@/components/navigation/patient-nav";
import { TimerProvider } from "@/providers/timer-provider";
import { ActiveTimerWidget } from "@/components/patient/active-timer-widget";

export default async function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireRole("patient");

  return (
    <TimerProvider>
      <div className="min-h-screen flex flex-col bg-slate-50">
        <PatientNav profile={profile} />
        <main className="flex-1 max-w-2xl w-full mx-auto p-4 sm:p-6 pb-24">
          {children}
        </main>
        <ActiveTimerWidget />
      </div>
    </TimerProvider>
  );
}
