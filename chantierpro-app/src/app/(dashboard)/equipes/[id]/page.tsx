import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Users, Phone, Wrench } from "lucide-react";
import { AddMemberForm } from "./add-member-form";
import { MemberActions } from "./member-actions";

const roleLabels: Record<string, string> = {
  chef_equipe: "Chef d'équipe",
  ouvrier: "Ouvrier",
  apprenti: "Apprenti",
  manoeuvre: "Manoeuvre",
};

const specialtyLabels: Record<string, string> = {
  general: "Général", maconnerie: "Maçonnerie", electricite: "Électricité",
  plomberie: "Plomberie", peinture: "Peinture", charpente: "Charpente",
  ferraillage: "Ferraillage", coffrage: "Coffrage", finition: "Finition", autre: "Autre",
};

export default async function TeamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: team } = await supabase
    .from("teams")
    .select("*, chantiers(name), team_members(*)")
    .eq("id", id)
    .single();

  if (!team) notFound();

  const members = Array.isArray(team.team_members) ? team.team_members : [];
  const chantierName = team.chantiers && typeof team.chantiers === "object"
    ? (team.chantiers as { name: string }).name : "—";
  const totalDailyRate = members.filter((m: { is_active: boolean }) => m.is_active).reduce((s: number, m: { daily_rate: number }) => s + (m.daily_rate || 0), 0);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/equipes">
          <Button variant="ghost" size="sm"><ArrowLeft size={16} /></Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">{team.name}</h1>
          <p className="flex items-center gap-2 text-sm text-zinc-500">
            <Wrench size={14} /> {specialtyLabels[team.specialty] ?? team.specialty} · {chantierName}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <p className="text-xs text-zinc-500">Total membres</p>
          <p className="text-2xl font-bold text-white">{members.length}</p>
        </Card>
        <Card>
          <p className="text-xs text-zinc-500">Actifs</p>
          <p className="text-2xl font-bold text-green-400">{members.filter((m: { is_active: boolean }) => m.is_active).length}</p>
        </Card>
        <Card>
          <p className="text-xs text-zinc-500">Coût jour</p>
          <p className="text-2xl font-bold text-white">{totalDailyRate.toLocaleString("fr-FR")} FCFA</p>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
          <Users size={18} /> Membres
        </h2>

        {members.length === 0 ? (
          <Card className="text-sm text-zinc-500 text-center py-8">Aucun membre dans cette équipe</Card>
        ) : (
          <div className="space-y-2">
            {members.map((m: { id: string; full_name: string; role: string; phone: string | null; daily_rate: number; is_active: boolean }) => (
              <Card key={m.id} className={`flex items-center justify-between ${!m.is_active ? "opacity-50" : ""}`}>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-white">{m.full_name}</p>
                    <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs text-zinc-400">
                      {roleLabels[m.role] ?? m.role}
                    </span>
                    {!m.is_active && <span className="text-xs text-red-400">Inactif</span>}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-zinc-500">
                    {m.phone && <span className="flex items-center gap-1"><Phone size={11} />{m.phone}</span>}
                    <span>{Number(m.daily_rate).toLocaleString("fr-FR")} FCFA/jour</span>
                  </div>
                </div>
                <MemberActions memberId={m.id} isActive={m.is_active} />
              </Card>
            ))}
          </div>
        )}
      </div>

      <AddMemberForm teamId={id} />
    </div>
  );
}
