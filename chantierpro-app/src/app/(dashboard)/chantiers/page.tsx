import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, MapPin } from "lucide-react";

const statusLabels: Record<string, { label: string; color: string }> = {
  planifie: { label: "Planifié", color: "bg-blue-500/20 text-blue-400" },
  en_cours: { label: "En cours", color: "bg-green-500/20 text-green-400" },
  suspendu: { label: "Suspendu", color: "bg-yellow-500/20 text-yellow-400" },
  termine: { label: "Terminé", color: "bg-zinc-500/20 text-zinc-400" },
  annule: { label: "Annulé", color: "bg-red-500/20 text-red-400" },
};

export default async function ChantiersPage() {
  const supabase = await createClient();
  const { data: chantiers } = await supabase
    .from("chantiers")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Chantiers</h1>
        <Link href="/chantiers/new">
          <Button><Plus size={16} className="mr-2" />Nouveau chantier</Button>
        </Link>
      </div>

      {(!chantiers || chantiers.length === 0) ? (
        <Card className="text-center text-zinc-500 py-12">
          Aucun chantier. Créez votre premier chantier pour commencer.
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {chantiers.map((c) => {
            const s = statusLabels[c.status] ?? statusLabels.planifie;
            return (
              <Link key={c.id} href={`/chantiers/${c.id}`}>
                <Card className="hover:border-zinc-600 transition-colors cursor-pointer space-y-3">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-white">{c.name}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-xs ${s.color}`}>{s.label}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-zinc-500">
                    <MapPin size={12} /> {c.city}
                  </div>
                  <p className="text-sm text-zinc-400">
                    Budget : {Number(c.budget).toLocaleString("fr-FR")} FCFA
                  </p>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
