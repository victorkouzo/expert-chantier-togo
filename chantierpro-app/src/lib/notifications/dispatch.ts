import { createClient } from "@/lib/supabase/server";
import { sendEmail, sendWhatsApp, sendSMS, type Channel, type SendResult } from "./channels";

export interface Recipient {
  userId?: string;       // pour la notification in-app
  email?: string;
  phone?: string;
}

export interface NotifyOptions {
  recipient: Recipient;
  channels: Channel[];
  // in-app
  title: string;
  message: string;
  link?: string;
  type?: "info" | "warning" | "success" | "error";
  // contenu enrichi pour l'email (sinon le message brut est utilisé)
  emailSubject?: string;
  emailHtml?: string;
}

// Envoie une notification sur les canaux demandés + enregistre une notification in-app
export async function notify(opts: NotifyOptions): Promise<SendResult[]> {
  const results: SendResult[] = [];

  // 1. Notification in-app (toujours, si on a un userId)
  if (opts.recipient.userId) {
    const supabase = await createClient();
    await supabase.from("notifications").insert({
      user_id: opts.recipient.userId,
      title: opts.title,
      message: opts.message,
      type: opts.type ?? "info",
      link: opts.link ?? null,
      is_read: false,
    });
  }

  // 2. Canaux externes
  await Promise.all(
    opts.channels.map(async (channel) => {
      if (channel === "email" && opts.recipient.email) {
        results.push(
          await sendEmail(
            opts.recipient.email,
            opts.emailSubject ?? opts.title,
            opts.emailHtml ?? `<p>${opts.message}</p>`
          )
        );
      } else if (channel === "whatsapp" && opts.recipient.phone) {
        results.push(await sendWhatsApp(opts.recipient.phone, `*${opts.title}*\n${opts.message}`));
      } else if (channel === "sms" && opts.recipient.phone) {
        results.push(await sendSMS(opts.recipient.phone, `${opts.title}: ${opts.message}`));
      }
    })
  );

  return results;
}
