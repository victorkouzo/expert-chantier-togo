import { Resend } from "resend";

export type Channel = "email" | "whatsapp" | "sms";

export interface SendResult {
  channel: Channel;
  ok: boolean;
  error?: string;
  skipped?: boolean;
}

// --- Email via Resend ---
export async function sendEmail(to: string, subject: string, html: string): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM ?? "ChantierPro <onboarding@resend.dev>";
  if (!apiKey) return { channel: "email", ok: false, skipped: true, error: "RESEND_API_KEY manquante" };

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({ from, to, subject, html });
    if (error) return { channel: "email", ok: false, error: error.message };
    return { channel: "email", ok: true };
  } catch (e) {
    return { channel: "email", ok: false, error: e instanceof Error ? e.message : "Erreur email" };
  }
}

// --- WhatsApp via Meta Cloud API ---
export async function sendWhatsApp(to: string, message: string): Promise<SendResult> {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;
  if (!token || !phoneId) {
    return { channel: "whatsapp", ok: false, skipped: true, error: "Identifiants WhatsApp manquants" };
  }

  // Normalise le numéro (retire +, espaces)
  const normalized = to.replace(/[^\d]/g, "");

  try {
    const res = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: normalized,
        type: "text",
        text: { body: message },
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { channel: "whatsapp", ok: false, error: data?.error?.message ?? `HTTP ${res.status}` };
    }
    return { channel: "whatsapp", ok: true };
  } catch (e) {
    return { channel: "whatsapp", ok: false, error: e instanceof Error ? e.message : "Erreur WhatsApp" };
  }
}

// --- SMS via fournisseur HTTP générique (compatible la plupart des API africaines) ---
// Configurez SMS_API_URL (POST), SMS_API_KEY, SMS_SENDER.
// Le corps envoyé : { to, message, sender }. Adaptez à votre fournisseur si besoin.
export async function sendSMS(to: string, message: string): Promise<SendResult> {
  const url = process.env.SMS_API_URL;
  const apiKey = process.env.SMS_API_KEY;
  const sender = process.env.SMS_SENDER ?? "ChantierPro";
  if (!url || !apiKey) {
    return { channel: "sms", ok: false, skipped: true, error: "Configuration SMS manquante" };
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ to, message, sender }),
    });
    if (!res.ok) {
      return { channel: "sms", ok: false, error: `HTTP ${res.status}` };
    }
    return { channel: "sms", ok: true };
  } catch (e) {
    return { channel: "sms", ok: false, error: e instanceof Error ? e.message : "Erreur SMS" };
  }
}

export function channelStatus() {
  return {
    email: !!process.env.RESEND_API_KEY,
    whatsapp: !!(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_ID),
    sms: !!(process.env.SMS_API_URL && process.env.SMS_API_KEY),
  };
}
