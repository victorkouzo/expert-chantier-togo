import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MapPin, Calendar, Users, FileText, Wallet, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { UpdateStatusForm } from "./update-status-form";

const statusLabels: Record<string, { label: string; color: string }> = {
  planifie: { label: "Planifié", color: "bg-blue-500/20 text-blue-400" },
  en_cours: { label: "En cours", color: "bg-green-500/20 text-green-400" },
  suspendu: { label: "Suspendu", color: "bg-yellow-500/20 text-yellow-400" },
  termine: { label: "Terminé", color: "bg-zinc-500/20 text-zinc-400" },
  annule: { label: "Annulé", color: "bg-red-500/20 text-red-400" },
};

export default async function ChantierDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: chantier }, { data: rapports }, { data: depenses }] = await Promise.all([
    supabase.from("chantiers").select("*, clients(id, name, phone, email)").eq("id", id).single(),
    supabase.from("daily_reports").select("*").eq("chantier_id", id).order("report_date", { ascending: false }).limit(5),
    supabase.from("expenses").select("*").eq("chantier_id", id).order("expense_date", { ascending: false }).limit(10),
  ]);

  if (!chantier) notFound();

  const totalDepenses = (depenses ?? []).reduce((s, d) => s + (d.amount || 0), 0);
  const budgetRestant = chantier.budget - totalDepenses;
  const s = statusLabels[chantier.status] ?? statusLabels.planifie;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/chantiers">
          <Button variant="ghost" size="sm"><ArrowLeft size={16} /></Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">{chantier.name}</h1>
            <span className={`rounded-full px-2 py-0.5 text-xs ${s.color}`}>{s.label}</span>
          </div>
          <p className="flex items-center gap-1 text-sm text-zinc-500"><MapPin size={14} /> {chantier.address}, {chantier.city}</p>
        </div>
        <UpdateStatusForm chantierId={id} currentStatus={chantier.status} />
      </div>

      {chantier.description && (
        <p className="text-sm text-zinc-400">{chantier.description}</p>
      )}

      <div className="flex flex-wrap gap-3 text-xs">
        {chantier.reference && (
          <span className="rounded bg-zinc-800 px-2 py-1 text-zinc-300">Réf : {chantier.reference}</span>
        )}
        {chantier.clients && typeof chantier.clients === "object" && !Array.isArray(chantier.clients) && (
          <Link
            href={`/clients/${(chantier.clients as { id: string }).id}`}
            className="rounded bg-blue-500/10 px-2 py-1 text-blue-400 hover:bg-blue-500/20"
          >
            Client : {(chantier.clients as { name: string }).name}
          </Link>
        )}
        {chantier.latitude && chantier.longitude && (
          <a
            href={`https://www.google.com/maps?q=${chantier.latitude},${chantier.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 rounded bg-zinc-800 px-2 py-1 text-zinc-300 hover:text-green-400"
          >
            <MapPin size={11} /> Voir sur la carte
          </a>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="flex items-center gap-3">
            <Calendar size={20} className="text-blue-400" />
            <div>
              <p className="text-xs text-zinc-500">Début</p>
              <p className="text-sm font-medium text-white">{format(new Date(chantier.start_date), "d MMM yyyy", { locale: fr })}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <Wallet size={20} className="text-green-400" />
            <div>
              <p className="text-xs text-zinc-500">Budget</p>
              <p className="text-sm font-medium text-white">{Number(chantier.budget).toLocaleString("fr-FR")} FCFA</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <Wallet size={20} className="text-red-400" />
            <div>
              <p className="text-xs text-zinc-500">Dépensé</p>
              <p className="text-sm font-medium text-white">{totalDepenses.toLocaleString("fr-FR")} FCFA</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <Wallet size={20} className={budgetRestant >= 0 ? "text-green-400" : "text-red-400"} />
            <div>
              <p className="text-xs text-zinc-500">Restant</p>
              <p className={`text-sm font-medium ${budgetRestant >= 0 ? "text-green-400" : "text-red-400"}`}>
                {budgetRestant.toLocaleString("fr-FR")} FCFA
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
              <FileText size={18} /> Derniers rapports
            </h2>
            <Link href={`/rapports/new?chantier=${id}`}>
              <Button size="sm">+ Rapport</Button>
            </Link>
          </div>
          {(!rapports || rapports.length === 0) ? (
            <Card className="text-sm text-zinc-500">Aucun rapport</Card>
          ) : (
            rapports.map((r) => (
              <Link key={r.id} href={`/rapports/${r.id}`}>
                <Card className="hover:border-zinc-600 transition-colors cursor-pointer mb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">
                        {format(new Date(r.report_date), "d MMMM yyyy", { locale: fr })}
                      </p>
                      <p className="text-xs text-zinc-500">{r.workers_present} ouvriers · {r.weather}</p>
                    </div>
                    <p className="max-w-xs truncate text-xs text-zinc-400">{r.summary}</p>
                  </div>
                </Card>
              </Link>
            ))
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
              <Users size={18} /> Dernières dépenses
            </h2>
            <Link href={`/depenses/new?chantier=${id}`}>
              <Button size="sm">+ Dépense</Button>
            </Link>
          </div>
          {(!depenses || depenses.length === 0) ? (
            <Card className="text-sm text-zinc-500">Aucune dépense</Card>
          ) : (
            depenses.map((d) => (
              <Card key={d.id} className="mb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">{d.description}</p>
                    <p className="text-xs text-zinc-500">
                      {format(new Date(d.expense_date), "d MMM yyyy", { locale: fr })}
                    </p>
                  </div>
                  <p className="font-semibold text-white">{Number(d.amount).toLocaleString("fr-FR")} FCFA</p>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
