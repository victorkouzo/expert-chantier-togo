"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PLANS, formatPrice, type PlanId } from "@/lib/plans";
import { Check } from "lucide-react";

interface Props {
  currentPlan?: PlanId;
  ctaHref?: (planId: PlanId) => string;
  ctaLabel?: (planId: PlanId) => string;
}

export function PricingCards({ currentPlan, ctaHref, ctaLabel }: Props) {
  const [yearly, setYearly] = useState(false);
  const plans = Object.values(PLANS);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-center gap-3">
        <span className={`text-sm ${!yearly ? "text-white" : "text-zinc-500"}`}>Mensuel</span>
        <button
          type="button"
          onClick={() => setYearly(!yearly)}
          className="relative h-6 w-11 rounded-full bg-zinc-700 transition-colors"
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-green-400 transition-transform ${
              yearly ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </button>
        <span className={`text-sm ${yearly ? "text-white" : "text-zinc-500"}`}>
          Annuel <span className="text-green-400">(-17%)</span>
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {plans.map((plan) => {
          const price = yearly ? plan.priceYearly : plan.priceMonthly;
          const isCurrent = currentPlan === plan.id;
          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl border p-6 ${
                plan.highlighted
                  ? "border-green-500 bg-green-500/5"
                  : "border-zinc-800 bg-zinc-950"
              }`}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-green-500 px-3 py-0.5 text-xs font-medium text-black">
                  Le plus populaire
                </span>
              )}

              <h3 className="text-xl font-bold text-white">{plan.name}</h3>
              <p className="mt-1 text-sm text-zinc-400">{plan.description}</p>

              <div className="mt-4">
                <span className="text-3xl font-bold text-white">{formatPrice(price)}</span>
                {price > 0 && (
                  <span className="text-sm text-zinc-500">/{yearly ? "an" : "mois"}</span>
                )}
              </div>

              <ul className="mt-6 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-zinc-300">
                    <Check size={16} className="mt-0.5 shrink-0 text-green-400" />
                    {f}
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                {isCurrent ? (
                  <Button variant="ghost" className="w-full" disabled>
                    Votre plan actuel
                  </Button>
                ) : (
                  <Link href={ctaHref ? ctaHref(plan.id) : `/register`}>
                    <Button
                      variant={plan.highlighted ? "primary" : "ghost"}
                      className="w-full"
                    >
                      {ctaLabel ? ctaLabel(plan.id) : plan.priceMonthly === 0 ? "Commencer gratuitement" : "Choisir ce plan"}
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
