"use client";

import { useActionState, useState } from "react";
import { sendTestNotification } from "./notification-actions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, MessageCircle, Smartphone, Check, X } from "lucide-react";

interface Props {
  status: { email: boolean; whatsapp: boolean; sms: boolean };
  defaultEmail: string;
}

const channels = [
  { id: "email" as const, label: "Email", icon: Mail, hint: "Resend", placeholder: "email" },
  { id: "whatsapp" as const, label: "WhatsApp", icon: MessageCircle, hint: "Meta Cloud API", placeholder: "phone" },
  { id: "sms" as const, label: "SMS", icon: Smartphone, hint: "API SMS", placeholder: "phone" },
];

export function NotificationSettings({ status, defaultEmail }: Props) {
  const [state, formAction, pending] = useActionState(sendTestNotification, null);
  const [selected, setSelected] = useState<"email" | "whatsapp" | "sms">("email");

  return (
    <Card className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-white">Notifications</h2>
        <p className="text-sm text-zinc-500">Canaux configurés et test d&apos;envoi.</p>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {channels.map((c) => {
          const Icon = c.icon;
          const active = status[c.id];
          const isSelected = selected === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelected(c.id)}
              className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                isSelected ? "border-green-500 bg-green-500/5" : "border-zinc-800 hover:border-zinc-700"
              }`}
            >
              <Icon size={20} className={active ? "text-green-400" : "text-zinc-600"} />
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{c.label}</p>
                <p className="text-xs text-zinc-500">{c.hint}</p>
              </div>
              {active ? (
                <span className="flex items-center gap-1 text-xs text-green-400"><Check size={12} /> Actif</span>
              ) : (
                <span className="flex items-center gap-1 text-xs text-zinc-600"><X size={12} /> Inactif</span>
              )}
            </button>
          );
        })}
      </div>

      <form action={formAction} className="space-y-3 border-t border-zinc-800 pt-4">
        <input type="hidden" name="channel" value={selected} />
        {selected === "email" ? (
          <Input label="Email de test" name="email" type="email" defaultValue={defaultEmail} placeholder="vous@exemple.com" />
        ) : (
          <Input label="Numéro de test" name="phone" type="tel" placeholder="+228 90 00 00 00" required />
        )}

        {state && "success" in state && state.success && (
          <p className="text-sm text-green-400">Notification de test envoyée !</p>
        )}
        {state && "error" in state && typeof state.error === "string" && (
          <p className="text-sm text-red-400">{state.error}</p>
        )}

        <Button type="submit" loading={pending}>
          Envoyer un test {channels.find((c) => c.id === selected)?.label}
        </Button>

        {!status[selected] && (
          <p className="text-xs text-yellow-500">
            Ce canal n&apos;est pas encore configuré. Ajoutez les variables d&apos;environnement correspondantes sur Vercel.
          </p>
        )}
      </form>
    </Card>
  );
}
