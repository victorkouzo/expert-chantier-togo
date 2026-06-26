import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSuperAdmin } from "@/lib/super-admin";

export { isSuperAdmin, SUPER_ADMIN_EMAIL } from "@/lib/super-admin";

export type Role = "admin" | "directeur" | "conducteur_travaux" | "chef_chantier" | "ouvrier" | "client";

export interface SessionContext {
  userId: string;
  email: string;
  fullName: string;
  role: Role;
  companyId: string;
  companyName: string;
  plan: string;
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

  if (!profile || !profile.company_id) return null;

  const company = profile.companies && typeof profile.companies === "object" && !Array.isArray(profile.companies)
    ? (profile.companies as { name: string; plan: string })
    : { name: "", plan: "starter" };

  return {
    userId: user.id,
    email: user.email ?? "",
    fullName: profile.full_name ?? "",
    role: (profile.role ?? "ouvrier") as Role,
    companyId: profile.company_id ?? "",
    companyName: company.name,
    plan: company.plan,
  };
}

export async function isAuthenticated(): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return !!user;
}

export async function requireSession(): Promise<SessionContext> {
  const session = await getSession();
  if (!session) {
    const authenticated = await isAuthenticated();
    if (authenticated) redirect("/setup");
    redirect("/login");
  }
  return session;
}

export async function requireRole(allowed: Role[]): Promise<SessionContext> {
  const session = await requireSession();
  if (!allowed.includes(session.role)) redirect("/dashboard");
  return session;
}

export async function requireSuperAdmin(): Promise<SessionContext> {
  const session = await requireSession();
  if (!isSuperAdmin(session.email)) redirect("/dashboard");
  return session;
}

export function canManageChantiers(role: Role) {
  return ["admin", "directeur", "conducteur_travaux"].includes(role);
}

export function canCreateReports(role: Role) {
  return ["admin", "directeur", "conducteur_travaux", "chef_chantier"].includes(role);
}

export function canManageTeam(role: Role) {
  return ["admin", "directeur"].includes(role);
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
  client: "Client",
};
