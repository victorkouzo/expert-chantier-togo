import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { HardHat, FileText, Wallet, AlertTriangle, Users, CheckSquare, FolderOpen, ClipboardCheck } from "lucide-react";
import { ExpenseChart } from "@/components/dashboard/expense-chart";
import { StatusChart } from "@/components/dashboard/status-chart";
import { TaskProgressChart } from "@/components/dashboard/task-progress-chart";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await requireSession();
  const supabase = await createClient();
  const role = session.role;

  const [chantiers, rapports, depenses, tasks, teams, documents, attendances] = await Promise.all([
    supabase.from("chantiers").select("id, name, status, budget", { count: "exact" }),
    supabase.from("daily_reports").select("id", { count: "exact" }),
    supabase.from("expenses").select("amount, category, chantier_id, chantiers(name)"),
    supabase.from("tasks").select("id, status, chantier_id, chantiers(name)"),
    supabase.from("team_members").select("id, is_active", { count: "exact" }),
    supabase.from("documents").select("id", { count: "exact" }),
    supabase.from("attendances").select("id, status").eq("attendance_date", new Date().toISOString().split("T")[0]),
  ]);

  const allChantiers = chantiers.data ?? [];
  const allDepenses = depenses.data ?? [];
  const allTasks = tasks.data ?? [];
  const totalDepenses = allDepenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const enCours = allChantiers.filter((c) => c.status === "en_cours").length;
  const activeMembers = (teams.data ?? []).filter((m) => m.is_active).length;
  const todayPresent = (attendances.data ?? []).filter((a) => a.status === "present" || a.status === "retard").length;

  const isDirection = ["admin", "directeur"].includes(role);
  const isField = ["conducteur_travaux", "chef_chantier"].includes(role);
  const isWorker = role === "ouvrier";
  const isClient = role === "client";

  const stats = [
    { label: "Chantiers", value: chantiers.count ?? 0, icon: HardHat, color: "text-green-400", href: "/chantiers", show: true },
    { label: "En cours", value: enCours, icon: AlertTriangle, color: "text-yellow-400", href: "/chantiers", show: !isWorker },
    { label: "Rapports", value: rapports.count ?? 0, icon: FileText, color: "text-blue-400", href: "/rapports", show: !isWorker },
    { label: "Dépenses (FCFA)", value: totalDepenses.toLocaleString("fr-FR"), icon: Wallet, color: "text-red-400", href: "/depenses", show: isDirection || isField },
    { label: "Ouvriers actifs", value: activeMembers, icon: Users, color: "text-purple-400", href: "/equipes", show: isDirection || isField },
    { label: "Présents aujourd'hui", value: todayPresent, icon: ClipboardCheck, color: "text-cyan-400", href: "/presences", show: isDirection || isField },
    { label: "Tâches", value: allTasks.length, icon: CheckSquare, color: "text-cyan-400", href: "/planning", show: !isClient },
    { label: "Documents", value: documents.count ?? 0, icon: FolderOpen, color: "text-orange-400", href: "/documents", show: !isWorker },
  ].filter((s) => s.show);

  const expenseByCategory: Record<string, number> = {};
  const categoryLabels: Record<string, string> = {
    materiaux: "Matériaux", main_oeuvre: "Main d'oeuvre", transport: "Transport",
    location_engin: "Location", autre: "Autre",
  };
  for (const d of allDepenses) {
    const key = categoryLabels[d.category] ?? d.category;
    expenseByCategory[key] = (expenseByCategory[key] || 0) + (d.amount || 0);
  }
  const expenseChartData = Object.entries(expenseByCategory).map(([name, montant]) => ({ name, montant }));

  const statusCounts: Record<string, number> = { planifie: 0, en_cours: 0, suspendu: 0, termine: 0, annule: 0 };
  for (const c of allChantiers) {
    statusCounts[c.status] = (statusCounts[c.status] || 0) + 1;
  }
  const statusChartData = [
    { name: "Planifié", value: statusCounts.planifie, color: "#3b82f6" },
    { name: "En cours", value: statusCounts.en_cours, color: "#22c55e" },
    { name: "Suspendu", value: statusCounts.suspendu, color: "#eab308" },
    { name: "Terminé", value: statusCounts.termine, color: "#71717a" },
    { name: "Annulé", value: statusCounts.annule, color: "#ef4444" },
  ];

  const tasksByChantier: Record<string, { name: string; a_faire: number; en_cours: number; termine: number; bloque: number }> = {};
  for (const t of allTasks) {
    const cName = t.chantiers && typeof t.chantiers === "object" && !Array.isArray(t.chantiers)
      ? (t.chantiers as unknown as { name: string }).name : "Inconnu";
    if (!tasksByChantier[cName]) tasksByChantier[cName] = { name: cName, a_faire: 0, en_cours: 0, termine: 0, bloque: 0 };
    const status = t.status as "a_faire" | "en_cours" | "termine" | "bloque";
    if (tasksByChantier[cName][status] !== undefined) tasksByChantier[cName][status]++;
  }
  const taskChartData = Object.values(tasksByChantier);

  const budgetData: { name: string; budget: number; depense: number }[] = [];
  for (const c of allChantiers) {
    const spent = allDepenses.filter((d) => d.chantier_id === c.id).reduce((s, d) => s + (d.amount || 0), 0);
    if (c.budget > 0 || spent > 0) {
      budgetData.push({ name: c.name, budget: Number(c.budget), depense: spent });
    }
  }

  const greeting = isClient ? "Suivi de vos chantiers" : isWorker ? "Mon espace" : "Tableau de bord";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">{greeting}</h1>
        <p className="text-sm text-zinc-500">Bonjour {session.fullName}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        {stats.map(({ label, value, icon: Icon, color, href }) => (
          <Link key={label} href={href}>
            <Card className="hover:border-zinc-600 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <Icon className={color} size={22} />
                <div>
                  <p className="text-xs text-zinc-500">{label}</p>
                  <p className="text-lg font-bold text-white">{value}</p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {(isDirection || isField) && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <h3 className="mb-4 text-sm font-semibold text-zinc-300">Dépenses par catégorie</h3>
            <ExpenseChart data={expenseChartData} />
          </Card>
          <Card>
            <h3 className="mb-4 text-sm font-semibold text-zinc-300">Statut des chantiers</h3>
            <StatusChart data={statusChartData} />
          </Card>
        </div>
      )}

      {isClient && (
        <Card>
          <h3 className="mb-4 text-sm font-semibold text-zinc-300">Statut de vos chantiers</h3>
          <StatusChart data={statusChartData} />
        </Card>
      )}

      {!isClient && !isWorker && (
        <Card>
          <h3 className="mb-4 text-sm font-semibold text-zinc-300">Tâches par chantier</h3>
          <TaskProgressChart data={taskChartData} />
        </Card>
      )}

      {(isDirection || isField) && budgetData.length > 0 && (
        <Card>
          <h3 className="mb-4 text-sm font-semibold text-zinc-300">Budget vs Dépenses par chantier</h3>
          <div className="space-y-3">
            {budgetData.map((c) => {
              const pct = c.budget > 0 ? Math.min(100, (c.depense / c.budget) * 100) : 0;
              const over = c.depense > c.budget;
              return (
                <div key={c.name} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white">{c.name}</span>
                    <span className={over ? "text-red-400" : "text-zinc-400"}>
                      {c.depense.toLocaleString("fr-FR")} / {c.budget.toLocaleString("fr-FR")} FCFA
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                    <div
                      className={`h-full rounded-full transition-all ${over ? "bg-red-500" : "bg-green-500"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
