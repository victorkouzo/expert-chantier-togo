import { requireSession } from "@/lib/auth";
import { getCompanyUsage } from "@/lib/billing";
import { getPlan, formatPrice } from "@/lib/plans";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { SubscribeForm } from "./subscribe-form";
import { Check, Clock } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const providerLabels: Record<string, string> = {
  flooz: "Flooz (Moov)", tmoney: "T-Money (Togocom)", wave: "Wave",
  orange_money: "Orange Money", card: "Carte bancaire", bank_transfer: "Virement",
};

function UsageBar({ label, used, limit }: { label: string; used: number; limit: number }) {
  const unlimited = limit === -1;
  const pct = unlimited ? 0 : Math.min(100, (used / limit) * 100);
  const over = !unlimited && used >= limit;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-zinc-400">{label}</span>
        <span className={over ? "text-red-400" : "text-zinc-300"}>
          {used} {unlimited ? "" : `/ ${limit}`}
        </span>
      </div>
      {!unlimited && (
        <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
          <div className={`h-full rounded-full ${over ? "bg-red-500" : "bg-green-500"}`} style={{ width: `${pct}%` }} />
        </div>
      )}
    </div>
  );
}

export default async function AbonnementPage() {
  const session = await requireSession();
  const supabase = await createClient();

  const plan = getPlan(session.plan);
  const usage = await getCompanyUsage(session.companyId);

  const { data: payments } = await supabase
    .from("payments")
    .select("*")
    .eq("company_id", session.companyId)
    .order("created_at", { ascending: false })
    .limit(5);

  const canManage = ["admin", "directeur"].includes(session.role);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-white">Abonnement</h1>

      <Card>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-zinc-500">Plan actuel</p>
            <p className="text-2xl font-bold text-white">{plan.name}</p>
            <p className="text-sm text-zinc-400">
              {plan.priceMonthly === 0 ? "Gratuit" : `${formatPrice(plan.priceMonthly)}/mois`}
            </p>
          </div>
          <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs text-green-400">Actif</span>
        </div>

        <div className="mt-6 space-y-3 border-t border-zinc-800 pt-4">
          <p className="text-sm font-semibold text-zinc-300">Utilisation</p>
          <UsageBar label="Chantiers" used={usage.chantiers} limit={plan.limits.chantiers} />
          <UsageBar label="Membres d'équipe" used={usage.teamMembers} limit={plan.limits.teamMembers} />
          <UsageBar label="Utilisateurs" used={usage.users} limit={plan.limits.users} />
        </div>
      </Card>

      {canManage ? (
        <SubscribeForm currentPlan={session.plan} />
      ) : (
        <Card className="text-sm text-zinc-500">
          Seuls les administrateurs et directeurs peuvent gérer l&apos;abonnement.
        </Card>
      )}

      {payments && payments.length > 0 && (
        <Card>
          <h2 className="mb-3 text-lg font-semibold text-white">Historique des paiements</h2>
          <div className="space-y-2">
            {payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded bg-zinc-800/50 px-3 py-2 text-sm">
                <div>
                  <span className="text-white capitalize">{p.plan}</span>
                  <span className="ml-2 text-xs text-zinc-500">
                    {providerLabels[p.provider] ?? p.provider} · {format(new Date(p.created_at), "d MMM yyyy", { locale: fr })}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-zinc-300">{Number(p.amount).toLocaleString("fr-FR")} FCFA</span>
                  {p.status === "confirmed" ? (
                    <span className="flex items-center gap-1 text-xs text-green-400"><Check size={12} /> Confirmé</span>
                  ) : p.status === "rejected" ? (
                    <span className="text-xs text-red-400">Rejeté</span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-yellow-400"><Clock size={12} /> En attente</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
