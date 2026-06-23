import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Bell, Info, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { MarkReadButton, MarkAllReadButton } from "./mark-read";

const typeConfig: Record<string, { icon: typeof Info; color: string }> = {
  info: { icon: Info, color: "text-blue-400" },
  warning: { icon: AlertTriangle, color: "text-yellow-400" },
  success: { icon: CheckCircle, color: "text-green-400" },
  error: { icon: XCircle, color: "text-red-400" },
};

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  const items = notifications ?? [];
  const unreadCount = items.filter((n) => !n.is_read).length;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          {unreadCount > 0 && (
            <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-medium text-red-400">
              {unreadCount} non lue{unreadCount > 1 ? "s" : ""}
            </span>
          )}
        </div>
        {unreadCount > 0 && <MarkAllReadButton />}
      </div>

      {items.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 py-16 text-zinc-500">
          <Bell size={32} />
          <p>Aucune notification</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {items.map((n) => {
            const tc = typeConfig[n.type] ?? typeConfig.info;
            const Icon = tc.icon;
            return (
              <Card key={n.id} className={`flex items-start gap-3 ${!n.is_read ? "border-l-2 border-l-green-500" : "opacity-60"}`}>
                <Icon size={18} className={`mt-0.5 ${tc.color}`} />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium text-white">{n.title}</p>
                  <p className="text-xs text-zinc-400">{n.message}</p>
                  <p className="text-xs text-zinc-600">
                    {format(new Date(n.created_at), "d MMM yyyy à HH:mm", { locale: fr })}
                  </p>
                </div>
                {!n.is_read && <MarkReadButton notificationId={n.id} />}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
