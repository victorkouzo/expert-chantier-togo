import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Sun, Cloud, CloudRain, CloudLightning, Users, Image as ImageIcon, Wrench } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ExportPdfButton } from "./export-pdf-button";

const weatherConfig: Record<string, { icon: typeof Sun; label: string; color: string }> = {
  soleil: { icon: Sun, label: "Soleil", color: "text-yellow-400" },
  nuageux: { icon: Cloud, label: "Nuageux", color: "text-zinc-400" },
  pluie: { icon: CloudRain, label: "Pluie", color: "text-blue-400" },
  orage: { icon: CloudLightning, label: "Orage", color: "text-purple-400" },
};

const tradeLabels: Record<string, string> = {
  maconnerie: "Maçonnerie", electricite: "Électricité", plomberie: "Plomberie",
  peinture: "Peinture", charpente: "Charpente", ferraillage: "Ferraillage",
  coffrage: "Coffrage", finition: "Finition", terrassement: "Terrassement",
  etancheite: "Étanchéité", carrelage: "Carrelage", menuiserie: "Menuiserie", autre: "Autre",
};

interface TradeDetail {
  trade: string;
  workers: number;
  description: string;
  progress: number;
}

export default async function RapportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: rapport } = await supabase
    .from("daily_reports")
    .select("*, chantiers(name, city), profiles(full_name)")
    .eq("id", id)
    .single();

  if (!rapport) notFound();

  const w = weatherConfig[rapport.weather] ?? weatherConfig.soleil;
  const WeatherIcon = w.icon;
  const chantierName = rapport.chantiers && typeof rapport.chantiers === "object"
    ? (rapport.chantiers as { name: string }).name : "—";
  const chantierCity = rapport.chantiers && typeof rapport.chantiers === "object"
    ? (rapport.chantiers as { city: string }).city : "";
  const authorName = rapport.profiles && typeof rapport.profiles === "object"
    ? (rapport.profiles as { full_name: string }).full_name : "—";
  const trades: TradeDetail[] = Array.isArray(rapport.trade_details) ? rapport.trade_details : [];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/rapports">
          <Button variant="ghost" size="sm"><ArrowLeft size={16} /></Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">
            Rapport du {format(new Date(rapport.report_date), "d MMMM yyyy", { locale: fr })}
          </h1>
          <p className="text-sm text-zinc-500">{chantierName} — {chantierCity}</p>
        </div>
        <ExportPdfButton rapport={{
          id: rapport.id,
          report_date: rapport.report_date,
          weather: w.label,
          temperature: rapport.temperature,
          summary: rapport.summary,
          workers_present: rapport.workers_present,
          tasks_completed: rapport.tasks_completed,
          issues: rapport.issues,
          chantier_name: chantierName,
          author_name: authorName,
        }} />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Card>
          <div className="flex items-center gap-2">
            <WeatherIcon size={20} className={w.color} />
            <div>
              <p className="text-xs text-zinc-500">Météo</p>
              <p className="text-sm font-medium text-white">
                {w.label}{rapport.temperature ? ` · ${rapport.temperature}°C` : ""}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-2">
            <Users size={20} className="text-green-400" />
            <div>
              <p className="text-xs text-zinc-500">Ouvriers</p>
              <p className="text-sm font-medium text-white">{rapport.workers_present}</p>
            </div>
          </div>
        </Card>
        <Card>
          <p className="text-xs text-zinc-500">Auteur</p>
          <p className="text-sm font-medium text-white">{authorName}</p>
        </Card>
      </div>

      <Card>
        <h3 className="mb-2 text-sm font-semibold text-zinc-300">Résumé des travaux</h3>
        <p className="whitespace-pre-wrap text-sm text-zinc-400">{rapport.summary}</p>
      </Card>

      <Card>
        <h3 className="mb-2 text-sm font-semibold text-zinc-300">Tâches accomplies</h3>
        <p className="whitespace-pre-wrap text-sm text-zinc-400">{rapport.tasks_completed}</p>
      </Card>

      {rapport.issues && (
        <Card className="border-yellow-500/30">
          <h3 className="mb-2 text-sm font-semibold text-yellow-400">Problèmes rencontrés</h3>
          <p className="whitespace-pre-wrap text-sm text-zinc-400">{rapport.issues}</p>
        </Card>
      )}

      {trades.length > 0 && (
        <div className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
            <Wrench size={16} /> Détails par corps de métier ({trades.length})
          </h3>
          {trades.map((t, i) => (
            <Card key={i}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-green-500/10 px-2 py-0.5 text-xs text-green-400">
                    {tradeLabels[t.trade] ?? t.trade}
                  </span>
                  <span className="text-xs text-zinc-500">{t.workers} ouvrier{t.workers > 1 ? "s" : ""}</span>
                </div>
                <span className="text-xs font-medium text-zinc-300">{t.progress}%</span>
              </div>
              {t.description && (
                <p className="text-sm text-zinc-400">{t.description}</p>
              )}
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-800">
                <div className="h-full rounded-full bg-green-500" style={{ width: `${t.progress}%` }} />
              </div>
            </Card>
          ))}
        </div>
      )}

      {rapport.photos && rapport.photos.length > 0 && (
        <div className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
            <ImageIcon size={16} /> Photos ({rapport.photos.length})
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {rapport.photos.map((url: string, i: number) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="overflow-hidden rounded-lg border border-zinc-700">
                <img src={url} alt={`Photo ${i + 1}`} className="aspect-video w-full object-cover transition-transform hover:scale-105" />
              </a>
            ))}
          </div>
        </div>
      )}

      {rapport.signature_data && (
        <Card>
          <h3 className="mb-2 text-sm font-semibold text-zinc-300">Signature</h3>
          <img src={rapport.signature_data} alt="Signature" className="h-20 rounded bg-zinc-900 p-2" />
        </Card>
      )}
    </div>
  );
}
