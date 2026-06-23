import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Users, Wrench } from "lucide-react";

const specialtyLabels: Record<string, string> = {
  general: "Général",
  maconnerie: "Maçonnerie",
  electricite: "Électricité",
  plomberie: "Plomberie",
  peinture: "Peinture",
  charpente: "Charpente",
  ferraillage: "Ferraillage",
  coffrage: "Coffrage",
  finition: "Finition",
  autre: "Autre",
};

export default async function EquipesPage() {
  const supabase = await createClient();
  const { data: teams } = await supabase
    .from("teams")
    .select("*, chantiers(name), team_members(id, is_active)")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Équipes</h1>
        <Link href="/equipes/new">
          <Button><Plus size={16} className="mr-2" />Nouvelle équipe</Button>
        </Link>
      </div>

      {(!teams || teams.length === 0) ? (
        <Card className="text-center text-zinc-500 py-12">
          Aucune équipe. Créez votre première équipe pour commencer.
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((t) => {
            const members = Array.isArray(t.team_members) ? t.team_members : [];
            const activeCount = members.filter((m: { is_active: boolean }) => m.is_active).length;
            const chantierName = t.chantiers && typeof t.chantiers === "object"
              ? (t.chantiers as { name: string }).name : "—";

            return (
              <Link key={t.id} href={`/equipes/${t.id}`}>
                <Card className="hover:border-zinc-600 transition-colors cursor-pointer space-y-3">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-white">{t.name}</h3>
                    <span className="flex items-center gap-1 rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
                      <Wrench size={12} /> {specialtyLabels[t.specialty] ?? t.specialty}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500">{chantierName}</p>
                  <div className="flex items-center gap-1 text-sm text-zinc-400">
                    <Users size={14} /> {activeCount} membre{activeCount !== 1 ? "s" : ""} actif{activeCount !== 1 ? "s" : ""}
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
