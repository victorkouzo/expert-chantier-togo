import { createClient } from "@/lib/supabase/server";
import { getPlan, isWithinLimit, type Plan } from "@/lib/plans";

export interface UsageStats {
  chantiers: number;
  teamMembers: number;
  users: number;
}

export async function getCompanyUsage(companyId: string): Promise<UsageStats> {
  const supabase = await createClient();

  const [chantiers, teamMembers, users] = await Promise.all([
    supabase.from("chantiers").select("id", { count: "exact", head: true }).eq("company_id", companyId),
    supabase.from("team_members").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("company_id", companyId),
  ]);

  return {
    chantiers: chantiers.count ?? 0,
    teamMembers: teamMembers.count ?? 0,
    users: users.count ?? 0,
  };
}

export interface LimitCheck {
  allowed: boolean;
  used: number;
  limit: number;
  plan: Plan;
}

export async function checkChantierLimit(companyId: string, planId: string): Promise<LimitCheck> {
  const plan = getPlan(planId);
  const usage = await getCompanyUsage(companyId);
  return {
    allowed: isWithinLimit(usage.chantiers, plan.limits.chantiers),
    used: usage.chantiers,
    limit: plan.limits.chantiers,
    plan,
  };
}

export async function checkTeamMemberLimit(companyId: string, planId: string): Promise<LimitCheck> {
  const plan = getPlan(planId);
  const usage = await getCompanyUsage(companyId);
  return {
    allowed: isWithinLimit(usage.teamMembers, plan.limits.teamMembers),
    used: usage.teamMembers,
    limit: plan.limits.teamMembers,
    plan,
  };
}
