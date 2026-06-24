"use client";

import { useActionState } from "react";
import { updatePaymentStatus } from "./actions";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

interface Payment {
  id: string;
  plan: string;
  billing_cycle: string;
  amount: number;
  method: string;
  provider: string | null;
  phone: string | null;
  reference: string | null;
  status: string;
  created_at: string;
  confirmed_at: string | null;
  company_name: string;
  requested_by_name: string;
  requested_by_email: string;
}

const planLabels: Record<string, string> = {
  starter: "Starter",
  pro: "Pro",
  entreprise: "Entreprise",
};

const methodLabels: Record<string, string> = {
  mobile_money: "Mobile Money",
  card: "Carte bancaire",
  bank_transfer: "Virement",
  manual: "Manuel",
};

const providerLabels: Record<string, string> = {
  flooz: "Flooz",
  tmoney: "T-Money",
  wave: "Wave",
  orange_money: "Orange Money",
};

const statusStyles: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-400",
  confirmed: "bg-green-500/10 text-green-400",
  rejected: "bg-red-500/10 text-red-400",
};

const statusLabels: Record<string, string> = {
  pending: "En attente",
  confirmed: "Confirmé",
  rejected: "Rejeté",
};

export function PaymentRow({ payment }: { payment: Payment }) {
  const [state, formAction, pending] = useActionState(updatePaymentStatus, null);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold text-white">{payment.company_name}</p>
          <p className="text-xs text-zinc-500">
            {payment.requested_by_name} ({payment.requested_by_email})
          </p>
        </div>
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[payment.status]}`}>
          {statusLabels[payment.status]}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
        <div>
          <p className="text-zinc-500">Plan</p>
          <p className="text-white font-medium">{planLabels[payment.plan] ?? payment.plan}</p>
        </div>
        <div>
          <p className="text-zinc-500">Montant</p>
          <p className="text-white font-medium">{payment.amount.toLocaleString("fr-FR")} FCFA</p>
        </div>
        <div>
          <p className="text-zinc-500">Paiement</p>
          <p className="text-white">{methodLabels[payment.method] ?? payment.method}</p>
        </div>
        <div>
          <p className="text-zinc-500">Cycle</p>
          <p className="text-white">{payment.billing_cycle === "yearly" ? "Annuel" : "Mensuel"}</p>
        </div>
      </div>

      {(payment.provider || payment.phone || payment.reference) && (
        <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
          {payment.provider && (
            <div>
              <p className="text-zinc-500">Opérateur</p>
              <p className="text-white">{providerLabels[payment.provider] ?? payment.provider}</p>
            </div>
          )}
          {payment.phone && (
            <div>
              <p className="text-zinc-500">Téléphone</p>
              <p className="text-white">{payment.phone}</p>
            </div>
          )}
          {payment.reference && (
            <div>
              <p className="text-zinc-500">Référence</p>
              <p className="text-white font-mono text-xs">{payment.reference}</p>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-zinc-500">
        <span>Demandé le {new Date(payment.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
        {payment.confirmed_at && (
          <span>Confirmé le {new Date(payment.confirmed_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</span>
        )}
      </div>

      {state && "error" in state && (
        <p className="text-xs text-red-400">{state.error}</p>
      )}

      {payment.status === "pending" && (
        <div className="flex gap-2 pt-1">
          <form action={formAction}>
            <input type="hidden" name="payment_id" value={payment.id} />
            <input type="hidden" name="action" value="confirm" />
            <Button type="submit" size="sm" loading={pending} className="gap-1">
              <Check size={14} /> Confirmer
            </Button>
          </form>
          <form action={formAction}>
            <input type="hidden" name="payment_id" value={payment.id} />
            <input type="hidden" name="action" value="reject" />
            <Button type="submit" variant="danger" size="sm" loading={pending} className="gap-1">
              <X size={14} /> Rejeter
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
