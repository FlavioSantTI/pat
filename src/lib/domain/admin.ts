import { createClient } from "@/lib/supabase/server";

export type AdminDashboardMetrics = {
  organizationsCount: number;
  professionalsCount: number;
  patientsCount: number;
  activeSubscriptionsCount: number;
  openTicketsCount: number;
  recentLogs: AdminAuditLogRow[];
};

export type AdminOrganizationRow = {
  id: string;
  name: string;
  created_at: string;
  professionals_count?: number;
};

export type AdminUserRow = {
  id: string;
  email: string;
  role: string;
  display_name: string | null;
  phone: string | null;
  created_at: string;
};

export type AdminProfessionalRow = {
  id: string;
  user_id: string;
  organization_id: string | null;
  crp: string;
  specialty: string | null;
  display_name?: string | null;
  email?: string | null;
  organization_name?: string | null;
  created_at: string;
};

export type AdminPlanRow = {
  id: string;
  name: string;
  interval: string;
  active: boolean;
  created_at: string;
};

export type AdminSubscriptionRow = {
  id: string;
  organization_id: string;
  plan_id: string;
  status: string;
  renews_at: string | null;
  created_at: string;
  organizations?: {
    name: string;
  } | null;
  plans?: {
    name: string;
    interval: string;
  } | null;
};

export type AdminSupportTicketRow = {
  id: string;
  organization_id: string | null;
  created_by: string | null;
  subject: string;
  status: string;
  created_at: string;
  updated_at: string;
  users?: {
    email: string;
    display_name: string | null;
  } | null;
  organizations?: {
    name: string;
  } | null;
};

export type AdminAuditLogRow = {
  id: string;
  actor_user_id: string | null;
  organization_id: string | null;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  users?: {
    email: string;
    display_name: string | null;
  } | null;
};

export async function getAdminDashboardMetrics(): Promise<AdminDashboardMetrics> {
  const supabase = await createClient();

  const [
    { count: organizationsCount },
    { count: professionalsCount },
    { count: patientsCount },
    { count: activeSubscriptionsCount },
    { count: openTicketsCount },
    { data: recentLogsData },
  ] = await Promise.all([
    supabase.from("organizations").select("*", { count: "exact", head: true }),
    supabase.from("professionals").select("*", { count: "exact", head: true }),
    supabase.from("patients").select("*", { count: "exact", head: true }),
    supabase
      .from("subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("status", "active"),
    supabase
      .from("support_tickets")
      .select("*", { count: "exact", head: true })
      .eq("status", "open"),
    supabase
      .from("audit_logs")
      .select(`
        id,
        actor_user_id,
        organization_id,
        action,
        resource_type,
        resource_id,
        metadata,
        created_at,
        users (
          email,
          display_name
        )
      `)
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  return {
    organizationsCount: organizationsCount ?? 0,
    professionalsCount: professionalsCount ?? 0,
    patientsCount: patientsCount ?? 0,
    activeSubscriptionsCount: activeSubscriptionsCount ?? 0,
    openTicketsCount: openTicketsCount ?? 0,
    recentLogs: (recentLogsData as unknown as AdminAuditLogRow[]) ?? [],
  };
}

export async function getAdminUsersAndOrganizations(): Promise<{
  organizations: AdminOrganizationRow[];
  users: AdminUserRow[];
  professionals: AdminProfessionalRow[];
}> {
  const supabase = await createClient();

  const [
    { data: orgsData },
    { data: usersData },
    { data: prosData },
  ] = await Promise.all([
    supabase
      .from("organizations")
      .select("id, name, created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("users")
      .select("id, email, role, display_name, phone, created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("professionals")
      .select(`
        id,
        user_id,
        organization_id,
        crp,
        specialty,
        created_at,
        users (
          email,
          display_name
        ),
        organizations (
          name
        )
      `)
      .order("created_at", { ascending: false }),
  ]);

  interface RawProQuery {
    id: string;
    user_id: string;
    organization_id: string | null;
    crp: string;
    specialty: string | null;
    created_at: string;
    users?: { email?: string; display_name?: string | null } | null;
    organizations?: { name?: string } | null;
  }

  const rawPros = (prosData as unknown as RawProQuery[]) ?? [];
  const mappedPros: AdminProfessionalRow[] = rawPros.map((p) => ({
    id: p.id,
    user_id: p.user_id,
    organization_id: p.organization_id,
    crp: p.crp,
    specialty: p.specialty,
    display_name: p.users?.display_name ?? null,
    email: p.users?.email ?? null,
    organization_name: p.organizations?.name ?? null,
    created_at: p.created_at,
  }));

  return {
    organizations: (orgsData as unknown as AdminOrganizationRow[]) ?? [],
    users: (usersData as unknown as AdminUserRow[]) ?? [],
    professionals: mappedPros,
  };
}

export async function getAdminPlansAndSubscriptions(): Promise<{
  plans: AdminPlanRow[];
  subscriptions: AdminSubscriptionRow[];
}> {
  const supabase = await createClient();

  const [{ data: plansData }, { data: subsData }] = await Promise.all([
    supabase
      .from("plans")
      .select("id, name, interval, active, created_at")
      .order("created_at", { ascending: true }),
    supabase
      .from("subscriptions")
      .select(`
        id,
        organization_id,
        plan_id,
        status,
        renews_at,
        created_at,
        organizations (
          name
        ),
        plans (
          name,
          interval
        )
      `)
      .order("created_at", { ascending: false }),
  ]);

  return {
    plans: (plansData as unknown as AdminPlanRow[]) ?? [],
    subscriptions: (subsData as unknown as AdminSubscriptionRow[]) ?? [],
  };
}

export async function getAdminSupportAndAudit(): Promise<{
  tickets: AdminSupportTicketRow[];
  auditLogs: AdminAuditLogRow[];
}> {
  const supabase = await createClient();

  const [{ data: ticketsData }, { data: logsData }] = await Promise.all([
    supabase
      .from("support_tickets")
      .select(`
        id,
        organization_id,
        created_by,
        subject,
        status,
        created_at,
        updated_at,
        users (
          email,
          display_name
        ),
        organizations (
          name
        )
      `)
      .order("created_at", { ascending: false }),
    supabase
      .from("audit_logs")
      .select(`
        id,
        actor_user_id,
        organization_id,
        action,
        resource_type,
        resource_id,
        metadata,
        created_at,
        users (
          email,
          display_name
        )
      `)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  return {
    tickets: (ticketsData as unknown as AdminSupportTicketRow[]) ?? [],
    auditLogs: (logsData as unknown as AdminAuditLogRow[]) ?? [],
  };
}
