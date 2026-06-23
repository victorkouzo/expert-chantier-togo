import { requireSession } from "@/lib/auth";
import { getPlan } from "@/lib/plans";
import { isAIConfigured } from "@/lib/anthropic";
import { computeAlerts } from "@/lib/alerts";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, AlertTriangle, AlertCircle, Info, Lock } from "lucide-react";
import { AssistantChat } from "./assistant-chat";
import { ReportGenerator } from "./report-generator";

const alertConfig = {
  danger: { icon: AlertTriangle, color: "text-red-400", border: "border-red-500/30" },
  warning: { icon: AlertCircle, color: "text-yellow-400", border: "border-yellow-500/30" },
  info: { icon: Info, color: "text-blue-400", border: "border-blue-500/30" },
};

export default async function AssistantPage() {
  const session = await requireSession();
  const plan = getPlan(session.plan);
  const hasAI = plan.limits.aiReports;
  const aiConfigured = isAIConfigured();

  // Les alertes prédictives déterministes sont disponibles pour tous
  const alerts = await computeAlerts(session.companyId);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Sparkles className="text-green-400" size={24} />
        <h1 className="text-2xl font-bold text-white">Assistant IA</h1>
      </div>

      {/* Alertes prédictives */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-white">Alertes prédictives</h2>
        {alerts.length === 0 ? (
          <Card className="text-sm text-zinc-500">Aucune alerte. Tout est sous contrôle 👍</Card>
        ) : (
          alerts.map((a, i) => {
            const cfg = alertConfig[a.level];
            const Icon = cfg.icon;
            return (
              <Card key={i} className={cfg.border}>
                <div className="flex items-start gap-3">
                  <Icon size={18} className={`mt-0.5 shrink-0 ${cfg.color}`} />
                  <div>
                    <p className="text-sm font-medium text-white">
                      {a.title}
                      {a.chantier && <span className="ml-2 text-xs text-zinc-500">— {a.chantier}</span>}
                    </p>
                    <p className="text-sm text-zinc-400">{a.detail}</p>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Fonctions IA (plan Entreprise) */}
      {!hasAI ? (
        <Card className="border-green-500/30 text-center">
          <Lock className="mx-auto mb-3 text-green-400" size={28} />
          <h3 className="text-lg font-semibold text-white">Débloquez l&apos;Assistant IA</h3>
          <p className="mt-1 text-sm text-zinc-400">
            La génération de rapports par IA et l&apos;assistant conversationnel sont réservés au plan Entreprise.
          </p>
          <Link href="/abonnement" className="mt-4 inline-block">
            <Button>Passer au plan Entreprise</Button>
          </Link>
        </Card>
      ) : !aiConfigured ? (
        <Card className="border-yellow-500/30">
          <p className="text-sm text-yellow-400">
            L&apos;IA n&apos;est pas encore configurée. Ajoutez la variable d&apos;environnement <code className="rounded bg-zinc-800 px-1">ANTHROPIC_API_KEY</code> sur Vercel pour activer ces fonctionnalités.
          </p>
        </Card>
      ) : (
        <>
          <ReportGenerator />
          <AssistantChat />
        </>
      )}
    </div>
  );
}
