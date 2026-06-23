import { createClient } from "@/lib/supabase/server";

// Rassemble les données de l'entreprise pour fournir un contexte à l'IA
export async function buildCompanyContext(companyId: string): Promise<string> {
  const supabase = await createClient();

  const [chantiers, rapports, depenses, tasks] = await Promise.all([
    supabase.from("chantiers").select("id, name, status, budget, city, start_date, end_date").eq("company_id", companyId),
    supabase.from("daily_reports").select("report_date, summary, workers_present, weather, issues, chantier_id, chantiers(name)").order("report_date", { ascending: false }).limit(40),
    supabase.from("expenses").select("amount, category, description, expense_date, chantier_id").order("expense_date", { ascending: false }).limit(100),
    supabase.from("tasks").select("title, status, progress, chantier_id, end_date").limit(100),
  ]);

  const allChantiers = chantiers.data ?? [];
  const allDepenses = depenses.data ?? [];
  const allTasks = tasks.data ?? [];
  const allRapports = rapports.data ?? [];

  const lines: string[] = [];
  lines.push("=== CHANTIERS ===");
  for (const c of allChantiers) {
    const spent = allDepenses.filter((d) => d.chantier_id === c.id).reduce((s, d) => s + (d.amount || 0), 0);
    const chantierTasks = allTasks.filter((t) => t.chantier_id === c.id);
    const doneTasks = chantierTasks.filter((t) => t.status === "termine").length;
    lines.push(
      `- ${c.name} (${c.city}) | statut: ${c.status} | budget: ${Number(c.budget).toLocaleString("fr-FR")} FCFA | dépensé: ${spent.toLocaleString("fr-FR")} FCFA | début: ${c.start_date}${c.end_date ? ` | fin prévue: ${c.end_date}` : ""} | tâches: ${doneTasks}/${chantierTasks.length} terminées`
    );
  }

  lines.push("\n=== DERNIERS RAPPORTS JOURNALIERS ===");
  for (const r of allRapports.slice(0, 25)) {
    const cName = r.chantiers && typeof r.chantiers === "object" && !Array.isArray(r.chantiers)
      ? (r.chantiers as { name: string }).name : "?";
    lines.push(
      `- ${r.report_date} | ${cName} | ${r.workers_present} ouvriers | météo: ${r.weather} | ${r.summary?.slice(0, 200) ?? ""}${r.issues ? ` | PROBLÈME: ${r.issues.slice(0, 150)}` : ""}`
    );
  }

  lines.push("\n=== DÉPENSES RÉCENTES (par catégorie) ===");
  const byCat: Record<string, number> = {};
  for (const d of allDepenses) byCat[d.category] = (byCat[d.category] || 0) + (d.amount || 0);
  for (const [cat, amount] of Object.entries(byCat)) {
    lines.push(`- ${cat}: ${amount.toLocaleString("fr-FR")} FCFA`);
  }

  return lines.join("\n");
}
