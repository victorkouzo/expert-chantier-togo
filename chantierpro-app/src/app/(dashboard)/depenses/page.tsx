import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const categoryLabels: Record<string, string> = {
  materiaux: "Matériaux",
  main_oeuvre: "Main d'oeuvre",
  transport: "Transport",
  location_engin: "Location engin",
  autre: "Autre",
};

export default async function DepensesPage() {
  const supabase = await createClient();
  const { data: depenses } = await supabase
    .from("expenses")
    .select("*, chantiers(name)")
    .order("expense_date", { ascending: false });

  const total = (depenses ?? []).reduce((s, d) => s + (d.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dépenses</h1>
          <p className="text-sm text-zinc-400">Total : {total.toLocaleString("fr-FR")} FCFA</p>
        </div>
        <Link href="/depenses/new">
          <Button><Plus size={16} className="mr-2" />Nouvelle dépense</Button>
        </Link>
      </div>

      {(!depenses || depenses.length === 0) ? (
        <Card className="text-center text-zinc-500 py-12">
          Aucune dépense enregistrée.
        </Card>
      ) : (
        <div className="space-y-3">
          {depenses.map((d) => (
            <Card key={d.id} className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium text-white">{d.description}</p>
                <p className="text-xs text-zinc-500">
                  {categoryLabels[d.category] ?? d.category} ·{" "}
                  {(d as Record<string, unknown>).chantiers && typeof (d as Record<string, unknown>).chantiers === "object"
                    ? ((d as Record<string, unknown>).chantiers as { name: string }).name
                    : "—"}{" "}
                  · {format(new Date(d.expense_date), "d MMM yyyy", { locale: fr })}
                </p>
              </div>
              <p className="text-lg font-bold text-white">{Number(d.amount).toLocaleString("fr-FR")} FCFA</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
