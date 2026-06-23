import { createClient } from "@/lib/supabase/server";

export interface Alert {
  level: "danger" | "warning" | "info";
  title: string;
  detail: string;
  chantier?: string;
}

// Alertes prédictives déterministes (sans IA) — basées sur les seuils
export async function computeAlerts(companyId: string): Promise<Alert[]> {
  const supabase = await createClient();
  const alerts: Alert[] = [];

  const { data: chantiers } = await supabase
    .from("chantiers")
    .select("id, name, budget, status, end_date")
    .eq("company_id", companyId);

  const { data: expenses } = await supabase
    .from("expenses")
    .select("amount, chantier_id");

  const { data: tasks } = await supabase
    .from("tasks")
    .select("status, progress, end_date, chantier_id");

  const all = chantiers ?? [];
  const allExpenses = expenses ?? [];
  const allTasks = tasks ?? [];
  const today = new Date();

  for (const c of all) {
    if (c.status === "termine" || c.status === "annule") continue;

    const spent = allExpenses
      .filter((e) => e.chantier_id === c.id)
      .reduce((s, e) => s + (e.amount || 0), 0);
    const budget = Number(c.budget) || 0;

    // Dépassement de budget
    if (budget > 0 && spent > budget) {
      alerts.push({
        level: "danger",
        title: "Budget dépassé",
        detail: `Dépenses (${spent.toLocaleString("fr-FR")} FCFA) supérieures au budget (${budget.toLocaleString("fr-FR")} FCFA), soit ${Math.round((spent / budget - 1) * 100)}% de dépassement.`,
        chantier: c.name,
      });
    } else if (budget > 0 && spent >= budget * 0.85) {
      alerts.push({
        level: "warning",
        title: "Budget bientôt atteint",
        detail: `${Math.round((spent / budget) * 100)}% du budget consommé (${spent.toLocaleString("fr-FR")} / ${budget.toLocaleString("fr-FR")} FCFA).`,
        chantier: c.name,
      });
    }

    // Délai dépassé / proche
    if (c.end_date) {
      const end = new Date(c.end_date);
      const daysLeft = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const chantierTasks = allTasks.filter((t) => t.chantier_id === c.id);
      const doneRatio = chantierTasks.length > 0
        ? chantierTasks.filter((t) => t.status === "termine").length / chantierTasks.length
        : 0;

      if (daysLeft < 0) {
        alerts.push({
          level: "danger",
          title: "Délai dépassé",
          detail: `La date de fin prévue (${c.end_date}) est dépassée de ${Math.abs(daysLeft)} jour(s).`,
          chantier: c.name,
        });
      } else if (daysLeft <= 14 && doneRatio < 0.7 && chantierTasks.length > 0) {
        alerts.push({
          level: "warning",
          title: "Retard probable",
          detail: `Échéance dans ${daysLeft} jour(s) mais seulement ${Math.round(doneRatio * 100)}% des tâches terminées.`,
          chantier: c.name,
        });
      }
    }

    // Tâches bloquées
    const blocked = allTasks.filter((t) => t.chantier_id === c.id && t.status === "bloque").length;
    if (blocked > 0) {
      alerts.push({
        level: "info",
        title: "Tâches bloquées",
        detail: `${blocked} tâche(s) bloquée(s) nécessitent une intervention.`,
        chantier: c.name,
      });
    }
  }

  return alerts.sort((a, b) => {
    const order = { danger: 0, warning: 1, info: 2 };
    return order[a.level] - order[b.level];
  });
}
