import { getProfile, homeForRole } from "@/lib/auth/profile";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const profile = await getProfile();

  if (!profile) {
    redirect("/login");
  }

  redirect(homeForRole(profile.role));
}
