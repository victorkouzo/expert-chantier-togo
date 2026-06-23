export type PlanId = "starter" | "pro" | "entreprise";

export interface PlanLimits {
  chantiers: number;      // -1 = illimité
  teamMembers: number;
  users: number;          // membres de l'équipe (profils)
  storageMb: number;
  aiReports: boolean;
  advancedDashboard: boolean;
}

export interface Plan {
  id: PlanId;
  name: string;
  priceMonthly: number;   // FCFA
  priceYearly: number;    // FCFA
  description: string;
  features: string[];
  limits: PlanLimits;
  highlighted?: boolean;
}

export const PLANS: Record<PlanId, Plan> = {
  starter: {
    id: "starter",
    name: "Starter",
    priceMonthly: 0,
    priceYearly: 0,
    description: "Pour démarrer et tester la plateforme",
    features: [
      "1 chantier actif",
      "Jusqu'à 5 membres d'équipe",
      "Rapports journaliers",
      "Suivi des dépenses",
      "1 Go de stockage",
    ],
    limits: {
      chantiers: 1,
      teamMembers: 5,
      users: 2,
      storageMb: 1024,
      aiReports: false,
      advancedDashboard: false,
    },
  },
  pro: {
    id: "pro",
    name: "Pro",
    priceMonthly: 25000,
    priceYearly: 250000,
    description: "Pour les entreprises BTP en croissance",
    features: [
      "Chantiers illimités",
      "Jusqu'à 50 membres d'équipe",
      "Jusqu'à 10 utilisateurs",
      "Rapports détaillés par corps de métier",
      "Présences quotidiennes",
      "Factures & reçus",
      "Tableaux de bord avancés",
      "10 Go de stockage",
    ],
    limits: {
      chantiers: -1,
      teamMembers: 50,
      users: 10,
      storageMb: 10240,
      aiReports: false,
      advancedDashboard: true,
    },
    highlighted: true,
  },
  entreprise: {
    id: "entreprise",
    name: "Entreprise",
    priceMonthly: 75000,
    priceYearly: 750000,
    description: "Pour les grandes structures et groupes",
    features: [
      "Tout du plan Pro",
      "Utilisateurs illimités",
      "Membres d'équipe illimités",
      "Rapports générés par IA",
      "Assistant IA & alertes prédictives",
      "100 Go de stockage",
      "Support prioritaire",
    ],
    limits: {
      chantiers: -1,
      teamMembers: -1,
      users: -1,
      storageMb: 102400,
      aiReports: true,
      advancedDashboard: true,
    },
  },
};

export function getPlan(planId: string | null | undefined): Plan {
  return PLANS[(planId ?? "starter") as PlanId] ?? PLANS.starter;
}

export function isWithinLimit(used: number, limit: number): boolean {
  if (limit === -1) return true;
  return used < limit;
}

export function formatPrice(amount: number): string {
  if (amount === 0) return "Gratuit";
  return `${amount.toLocaleString("fr-FR")} FCFA`;
}
