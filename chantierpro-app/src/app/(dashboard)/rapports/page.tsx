import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Sun, Cloud, CloudRain, CloudLightning } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const weatherIcon: Record<string, React.ReactNode> = {
  soleil: <Sun size={16} className="text-yellow-400" />,
  nuageux: <Cloud size={16} className="text-zinc-400" />,
  pluie: <CloudRain size={16} className="text-blue-400" />,
  orage: <CloudLightning size={16} className="text-purple-400" />,
};

export default async function RapportsPage() {
  const supabase = await createClient();
  const { data: rapports } = await supabase
    .from("daily_reports")
    .select("*, chantiers(name)")
    .order("report_date", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Rapports journaliers</h1>
        <Link href="/rapports/new">
          <Button><Plus size={16} className="mr-2" />Nouveau rapport</Button>
        </Link>
      </div>

      {(!rapports || rapports.length === 0) ? (
        <Card className="text-center text-zinc-500 py-12">
          Aucun rapport. Créez votre premier rapport journalier.
        </Card>
      ) : (
        <div className="space-y-3">
          {rapports.map((r) => (
            <Link key={r.id} href={`/rapports/${r.id}`}>
            <Card className="flex items-center justify-between hover:border-zinc-600 transition-colors cursor-pointer">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {weatherIcon[r.weather]}
                  <span className="font-medium text-white">
                    {format(new Date(r.report_date), "d MMMM yyyy", { locale: fr })}
                  </span>
                </div>
                <p className="text-xs text-zinc-500">
                  {(r as Record<string, unknown>).chantiers && typeof (r as Record<string, unknown>).chantiers === "object"
                    ? ((r as Record<string, unknown>).chantiers as { name: string }).name
                    : "—"}{" "}
                  · {r.workers_present} ouvriers
                </p>
              </div>
              <p className="max-w-md truncate text-sm text-zinc-400">{r.summary}</p>
            </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
