import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { HardHat, FileText, Wallet, AlertTriangle } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();

  const [chantiers, rapports, depenses] = await Promise.all([
    supabase.from("chantiers").select("id, status", { count: "exact" }),
    supabase.from("daily_reports").select("id", { count: "exact" }),
    supabase.from("expenses").select("amount"),
  ]);

  const totalBudget = (depenses.data ?? []).reduce((sum, e) => sum + (e.amount || 0), 0);
  const enCours = (chantiers.data ?? []).filter((c) => c.status === "en_cours").length;

  const stats = [
    { label: "Chantiers", value: chantiers.count ?? 0, icon: HardHat, color: "text-green-400" },
    { label: "En cours", value: enCours, icon: AlertTriangle, color: "text-yellow-400" },
    { label: "Rapports", value: rapports.count ?? 0, icon: FileText, color: "text-blue-400" },
    { label: "Dépenses (FCFA)", value: totalBudget.toLocaleString("fr-FR"), icon: Wallet, color: "text-red-400" },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-white">Tableau de bord</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <div className="flex items-center gap-4">
              <Icon className={color} size={28} />
              <div>
                <p className="text-sm text-zinc-400">{label}</p>
                <p className="text-2xl font-bold text-white">{value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
