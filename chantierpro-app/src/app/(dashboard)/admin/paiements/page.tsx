import { createClient } from "@/lib/supabase/server";
import { requireSuperAdmin } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { PaymentRow } from "./payment-row";
import { CreditCard, Clock, CheckCircle, XCircle } from "lucide-react";

export default async function AdminPaymentsPage() {
  await requireSuperAdmin();
  const supabase = await createClient();

  const { data: payments } = await supabase
    .from("payments")
    .select(`
      id, plan, billing_cycle, amount, method, provider, phone, reference,
      status, created_at, confirmed_at,
      companies(name),
      profiles:requested_by(full_name, email)
    `)
    .order("created_at", { ascending: false });

  const formatted = (payments ?? []).map((p) => {
    const company = p.companies && typeof p.companies === "object" && !Array.isArray(p.companies)
      ? (p.companies as { name: string })
      : { name: "—" };
    const profile = p.profiles && typeof p.profiles === "object" && !Array.isArray(p.profiles)
      ? (p.profiles as { full_name: string; email: string })
      : { full_name: "—", email: "—" };
    return {
      id: p.id,
      plan: p.plan,
      billing_cycle: p.billing_cycle,
      amount: Number(p.amount),
      method: p.method,
      provider: p.provider,
      phone: p.phone,
      reference: p.reference,
      status: p.status,
      created_at: p.created_at,
      confirmed_at: p.confirmed_at,
      company_name: company.name,
      requested_by_name: profile.full_name,
      requested_by_email: profile.email,
    };
  });

  const pending = formatted.filter((p) => p.status === "pending");
  const confirmed = formatted.filter((p) => p.status === "confirmed");
  const rejected = formatted.filter((p) => p.status === "rejected");

  const totalRevenue = confirmed.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Gestion des paiements</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="flex items-center gap-3">
          <CreditCard className="text-green-400" size={24} />
          <div>
            <p className="text-xs text-zinc-500">Total encaissé</p>
            <p className="text-lg font-bold text-white">{totalRevenue.toLocaleString("fr-FR")} FCFA</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3">
          <Clock className="text-yellow-400" size={24} />
          <div>
            <p className="text-xs text-zinc-500">En attente</p>
            <p className="text-lg font-bold text-yellow-400">{pending.length}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3">
          <CheckCircle className="text-green-400" size={24} />
          <div>
            <p className="text-xs text-zinc-500">Confirmés</p>
            <p className="text-lg font-bold text-green-400">{confirmed.length}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3">
          <XCircle className="text-red-400" size={24} />
          <div>
            <p className="text-xs text-zinc-500">Rejetés</p>
            <p className="text-lg font-bold text-red-400">{rejected.length}</p>
          </div>
        </Card>
      </div>

      {/* Pending */}
      {pending.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-yellow-400">En attente de confirmation ({pending.length})</h2>
          {pending.map((p) => (
            <PaymentRow key={p.id} payment={p} />
          ))}
        </div>
      )}

      {pending.length === 0 && (
        <Card className="text-center py-8">
          <Clock className="mx-auto text-zinc-600 mb-2" size={32} />
          <p className="text-zinc-500">Aucun paiement en attente</p>
        </Card>
      )}

      {/* Confirmed */}
      {confirmed.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-green-400">Paiements confirmés ({confirmed.length})</h2>
          {confirmed.map((p) => (
            <PaymentRow key={p.id} payment={p} />
          ))}
        </div>
      )}

      {/* Rejected */}
      {rejected.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-red-400">Paiements rejetés ({rejected.length})</h2>
          {rejected.map((p) => (
            <PaymentRow key={p.id} payment={p} />
          ))}
        </div>
      )}
    </div>
  );
}
