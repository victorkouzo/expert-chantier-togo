"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { requestSubscription } from "./actions";
import { PLANS, formatPrice } from "@/lib/plans";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Check } from "lucide-react";

const providerOptions = [
  { value: "flooz", label: "Flooz (Moov)" },
  { value: "tmoney", label: "T-Money (Togocom)" },
  { value: "wave", label: "Wave" },
  { value: "orange_money", label: "Orange Money" },
  { value: "card", label: "Carte bancaire" },
  { value: "bank_transfer", label: "Virement bancaire" },
];

export function SubscribeForm({ currentPlan }: { currentPlan: string }) {
  const [state, formAction, pending] = useActionState(requestSubscription, null);
  const [selectedPlan, setSelectedPlan] = useState<"pro" | "entreprise">("pro");
  const [cycle, setCycle] = useState<"monthly" | "yearly">("monthly");
  const [provider, setProvider] = useState("flooz");
  const router = useRouter();

  useEffect(() => {
    if (state && "success" in state && state.success) {
      router.refresh();
    }
  }, [state, router]);

  const plan = PLANS[selectedPlan];
  const amount = cycle === "yearly" ? plan.priceYearly : plan.priceMonthly;
  const isMobileMoney = ["flooz", "tmoney", "wave", "orange_money"].includes(provider);

  const upgradablePlans = (["pro", "entreprise"] as const).filter((p) => p !== currentPlan);

  if (state && "success" in state && state.success) {
    return (
      <Card className="border-green-500/30">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-green-500/10 p-2">
            <Check className="text-green-400" size={20} />
          </div>
          <div>
            <p className="font-medium text-white">Demande envoyée !</p>
            <p className="text-sm text-zinc-400">
              Votre demande de paiement a été enregistrée. Elle sera confirmée sous peu et votre plan activé.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="mb-4 text-lg font-semibold text-white">Changer de plan</h2>

      <div className="mb-4 grid grid-cols-2 gap-3">
        {upgradablePlans.map((pid) => {
          const p = PLANS[pid];
          const active = selectedPlan === pid;
          return (
            <button
              key={pid}
              type="button"
              onClick={() => setSelectedPlan(pid)}
              className={`rounded-lg border p-3 text-left transition-colors ${
                active ? "border-green-500 bg-green-500/5" : "border-zinc-700 hover:border-zinc-600"
              }`}
            >
              <p className="font-medium text-white">{p.name}</p>
              <p className="text-sm text-zinc-400">{formatPrice(p.priceMonthly)}/mois</p>
            </button>
          );
        })}
      </div>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="plan" value={selectedPlan} />

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setCycle("monthly")}
            className={`flex-1 rounded-lg border py-2 text-sm transition-colors ${
              cycle === "monthly" ? "border-green-500 text-white" : "border-zinc-700 text-zinc-400"
            }`}
          >
            Mensuel
          </button>
          <button
            type="button"
            onClick={() => setCycle("yearly")}
            className={`flex-1 rounded-lg border py-2 text-sm transition-colors ${
              cycle === "yearly" ? "border-green-500 text-white" : "border-zinc-700 text-zinc-400"
            }`}
          >
            Annuel <span className="text-green-400">(-17%)</span>
          </button>
        </div>
        <input type="hidden" name="billing_cycle" value={cycle} />

        <Select
          label="Moyen de paiement"
          name="provider"
          options={providerOptions}
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
        />

        {isMobileMoney && (
          <>
            <Input
              label="Numéro Mobile Money"
              name="phone"
              type="tel"
              placeholder="+228 90 00 00 00"
              required
            />
            <Input
              label="Référence de transaction (optionnel)"
              name="reference"
              placeholder="ID de la transaction"
            />
          </>
        )}

        <div className="rounded-lg bg-zinc-800/50 p-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-zinc-400">Total à payer</span>
            <span className="text-lg font-bold text-white">{formatPrice(amount)}</span>
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            {cycle === "yearly" ? "Facturation annuelle" : "Facturation mensuelle"}
          </p>
        </div>

        {state && "error" in state && typeof state.error === "string" && (
          <p className="text-sm text-red-400">{state.error}</p>
        )}

        <Button type="submit" loading={pending} className="w-full">
          Confirmer le paiement
        </Button>

        <p className="text-center text-xs text-zinc-500">
          Après confirmation du paiement, votre plan sera activé par notre équipe.
        </p>
      </form>
    </Card>
  );
}
