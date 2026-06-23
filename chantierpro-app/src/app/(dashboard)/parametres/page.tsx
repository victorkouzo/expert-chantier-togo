import { createClient } from "@/lib/supabase/server";
import { requireSession, roleLabels, canManageTeam } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Building2, Users, Crown, Mail, X } from "lucide-react";
import { CompanyForm } from "./company-form";
import { InviteForm } from "./invite-form";
import { RevokeInviteButton } from "./revoke-invite-button";

const planLabels: Record<string, { label: string; color: string }> = {
  starter: { label: "Starter", color: "bg-blue-500/20 text-blue-400" },
  pro: { label: "Pro", color: "bg-purple-500/20 text-purple-400" },
  business: { label: "Business", color: "bg-green-500/20 text-green-400" },
};

export default async function ParametresPage() {
  const session = await requireSession();
  const supabase = await createClient();

  const [{ data: company }, { data: members }, { data: invitations }] = await Promise.all([
    supabase.from("companies").select("*").eq("id", session.companyId).single(),
    supabase.from("profiles").select("id, email, full_name, role").eq("company_id", session.companyId).order("created_at"),
    supabase.from("invitations").select("*").eq("company_id", session.companyId).eq("status", "pending").order("created_at", { ascending: false }),
  ]);

  const canManage = canManageTeam(session.role);
  const plan = planLabels[company?.plan ?? "starter"] ?? planLabels.starter;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Paramètres</h1>
        <span className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${plan.color}`}>
          <Crown size={12} /> Plan {plan.label}
        </span>
      </div>

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
          <Building2 size={18} /> Entreprise
        </h2>
        {canManage ? (
          <CompanyForm company={{
            name: company?.name ?? "",
            address: company?.address ?? "",
            city: company?.city ?? "Lomé",
            phone: company?.phone ?? "",
            email: company?.email ?? "",
          }} />
        ) : (
          <Card className="space-y-1 text-sm">
            <p className="font-medium text-white">{company?.name}</p>
            {company?.address && <p className="text-zinc-400">{company.address}, {company.city}</p>}
            {company?.phone && <p className="text-zinc-400">{company.phone}</p>}
          </Card>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
          <Users size={18} /> Équipe ({members?.length ?? 0})
        </h2>
        <div className="space-y-2">
          {(members ?? []).map((m) => (
            <Card key={m.id} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">
                  {m.full_name || m.email}
                  {m.id === session.userId && <span className="ml-2 text-xs text-green-400">(vous)</span>}
                </p>
                <p className="text-xs text-zinc-500">{m.email}</p>
              </div>
              <span className="rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-300">
                {roleLabels[m.role as keyof typeof roleLabels] ?? m.role}
              </span>
            </Card>
          ))}
        </div>
      </section>

      {canManage && (
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
            <Mail size={18} /> Invitations
          </h2>
          <InviteForm />

          {(invitations ?? []).length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-zinc-500">En attente</p>
              {invitations!.map((inv) => (
                <Card key={inv.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white">{inv.email}</p>
                    <p className="text-xs text-zinc-500">
                      {roleLabels[inv.role as keyof typeof roleLabels] ?? inv.role}
                      {" — Token : "}
                      <span className="font-mono">{inv.token.slice(0, 8)}...</span>
                    </p>
                  </div>
                  <RevokeInviteButton invitationId={inv.id} />
                </Card>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
