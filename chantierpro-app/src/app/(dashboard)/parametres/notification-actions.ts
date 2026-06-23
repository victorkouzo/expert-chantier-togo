"use server";

import { z } from "zod";
import { requireSession } from "@/lib/auth";
import { notify } from "@/lib/notifications/dispatch";
import { emailLayout } from "@/lib/notifications/templates";

const TestSchema = z.object({
  channel: z.enum(["email", "whatsapp", "sms"]),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
});

export async function sendTestNotification(_prevState: unknown, formData: FormData) {
  const session = await requireSession();
  const parsed = TestSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Données invalides" };

  const { channel } = parsed.data;
  const email = parsed.data.email || session.email;
  const phone = parsed.data.phone || undefined;

  if (channel !== "email" && !phone) {
    return { error: "Numéro de téléphone requis pour ce canal." };
  }

  const results = await notify({
    recipient: { userId: session.userId, email, phone },
    channels: [channel],
    title: "Test de notification ChantierPro",
    message: `Bonjour ${session.fullName}, ceci est un message de test envoyé depuis ${session.companyName}.`,
    type: "info",
    emailSubject: "Test de notification — ChantierPro",
    emailHtml: emailLayout(
      "Test réussi 🎉",
      `<p>Bonjour ${session.fullName},</p><p>Ceci est un message de test envoyé depuis <strong>${session.companyName}</strong>. Si vous recevez cet email, vos notifications par email sont bien configurées.</p>`
    ),
  });

  const result = results.find((r) => r.channel === channel);
  if (!result) return { error: "Aucun destinataire valide." };
  if (result.skipped) return { error: `Canal non configuré : ${result.error}` };
  if (!result.ok) return { error: result.error ?? "Échec de l'envoi" };

  return { success: true };
}
