import { requireSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { channelStatus } from "@/lib/notifications/channels";
import { NotificationSettings } from "./notification-settings";

export default async function ParametresPage() {
  const session = await requireSession();
  const supabase = await createClient();

  const { data: company } = await supabase
    .from("companies")
    .select("*")
    .eq("id", session.companyId)
    .single();

  const { data: invitations } = await supabase
    .from("invitations")
    .select("*")
    .eq("company_id", session.companyId)
    .order("created_at", { ascending: false });

  const notifStatus = channelStatus();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Paramètres</h1>

      <NotificationSettings status={notifStatus} defaultEmail={session.email} />

      <Card>
        <h2 className="text-lg font-semibold text-white mb-3">Entreprise</h2>
        <div className="space-y-2 text-sm">
          <p className="text-zinc-400">Nom : <span className="text-white">{company?.name ?? "—"}</span></p>
          <p className="text-zinc-400">Plan : <span className="text-white capitalize">{company?.plan ?? "starter"}</span></p>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-white mb-3">Invitations</h2>
        {(!invitations || invitations.length === 0) ? (
          <p className="text-sm text-zinc-500">Aucune invitation envoyée.</p>
        ) : (
          <div className="space-y-2">
            {invitations.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between rounded bg-zinc-800/50 px-3 py-2 text-sm">
                <div>
                  <span className="text-white">{inv.email}</span>
                  <span className="ml-2 text-xs text-zinc-500">{inv.role}</span>
                </div>
                <span className={`text-xs ${inv.accepted_at ? "text-green-400" : "text-yellow-400"}`}>
                  {inv.accepted_at ? "Acceptée" : "En attente"}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
