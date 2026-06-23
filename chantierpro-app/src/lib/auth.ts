import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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

  if (!profile || !profile.company_id) {
    // Profile missing — try to create it from user metadata (trigger may have failed)
    const meta = user.user_metadata ?? {};
    let companyId: string | null = null;

    const { data: existing } = await supabase
      .from("companies")
      .select("id")
      .limit(1)
      .single();

    if (existing) {
      companyId = existing.id;
    } else {
      const companyName = meta.company_name || meta.full_name ? `${meta.full_name} SARL` : "Mon entreprise";
      const { data: newCo } = await supabase
        .from("companies")
        .insert({ name: companyName, plan: "starter" })
        .select("id")
        .single();
      if (newCo) companyId = newCo.id;
    }

    if (companyId && !profile) {
      await supabase.from("profiles").insert({
        id: user.id,
        email: user.email ?? "",
        full_name: meta.full_name ?? "",
        role: "directeur",
        phone: meta.phone ?? null,
        company_id: companyId,
      });
    } else if (companyId && profile && !profile.company_id) {
      await supabase.from("profiles").update({ company_id: companyId }).eq("id", user.id);
    }

    if (!companyId) return null;

    const { data: refreshed } = await supabase
      .from("profiles")
      .select("full_name, role, company_id, companies(name, plan)")
      .eq("id", user.id)
      .single();
    if (!refreshed) return null;

    const co = refreshed.companies && typeof refreshed.companies === "object" && !Array.isArray(refreshed.companies)
      ? (refreshed.companies as { name: string; plan: string })
      : { name: "", plan: "starter" };

    return {
      userId: user.id,
      email: user.email ?? "",
      fullName: refreshed.full_name ?? "",
      role: (refreshed.role ?? "directeur") as Role,
      companyId: refreshed.company_id ?? "",
      companyName: co.name,
      plan: co.plan,
    };
  }

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
