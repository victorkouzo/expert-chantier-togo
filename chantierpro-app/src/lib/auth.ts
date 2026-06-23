import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type Role = "admin" | "directeur" | "conducteur_travaux" | "chef_chantier" | "ouvrier" | "client";

export interface SessionContext {
  userId: string;
  email: string;
  fullName: string;
  role: Role;
  companyId: string;
  companyName: string;
  plan: "starter" | "pro" | "business";
}

export async function getSession(): Promise<SessionContext | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, company_id, companies(name, plan)")
    .eq("id", user.id)
    .single();

  if (!profile?.company_id) return null;

  const company = profile.companies && typeof profile.companies === "object" && !Array.isArray(profile.companies)
    ? profile.companies as unknown as { name: string; plan: "starter" | "pro" | "business" }
    : { name: "—", plan: "starter" as const };

  return {
    userId: user.id,
    email: user.email ?? "",
    fullName: profile.full_name ?? "",
    role: profile.role as Role,
    companyId: profile.company_id,
    companyName: company.name,
    plan: company.plan,
  };
}

export async function requireSession(): Promise<SessionContext> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export async function requireRole(allowed: Role[]): Promise<SessionContext> {
  const session = await requireSession();
  if (!allowed.includes(session.role)) redirect("/dashboard");
  return session;
}

export function canManageChantiers(role: Role) {
  return role === "admin" || role === "directeur" || role === "conducteur_travaux";
}

export function canCreateReports(role: Role) {
  return role === "admin" || role === "directeur" || role === "conducteur_travaux" || role === "chef_chantier";
}

export function canManageTeam(role: Role) {
  return role === "admin" || role === "directeur";
}

export function isClient(role: Role) {
  return role === "client";
}

export function isWorker(role: Role) {
  return role === "ouvrier";
}

export const roleLabels: Record<Role, string> = {
  admin: "Administrateur",
  directeur: "Directeur",
  conducteur_travaux: "Conducteur de travaux",
  chef_chantier: "Chef de chantier",
  ouvrier: "Ouvrier",
  client: "Client / Maître d'ouvrage",
};
