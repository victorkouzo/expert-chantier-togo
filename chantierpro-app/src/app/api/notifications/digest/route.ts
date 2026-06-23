import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { computeAlerts } from "@/lib/alerts";
import { sendEmail } from "@/lib/notifications/channels";
import { alertEmail } from "@/lib/notifications/templates";

// Endpoint d'envoi des digests d'alertes par email.
// À déclencher via Vercel Cron. Protégé par CRON_SECRET.
// Header attendu : Authorization: Bearer <CRON_SECRET>
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
  }

  const supabase = await createClient();

  // Toutes les entreprises ayant des admins/directeurs
  const { data: managers } = await supabase
    .from("profiles")
    .select("email, full_name, company_id, role, companies(name)")
    .in("role", ["admin", "directeur"]);

  if (!managers || managers.length === 0) {
    return NextResponse.json({ sent: 0, message: "Aucun destinataire" });
  }

  // Regroupe par entreprise
  const byCompany = new Map<string, { name: string; emails: string[] }>();
  for (const m of managers) {
    if (!m.company_id || !m.email) continue;
    const companyName = m.companies && typeof m.companies === "object" && !Array.isArray(m.companies)
      ? (m.companies as { name: string }).name : "Votre entreprise";
    const entry = byCompany.get(m.company_id) ?? { name: companyName, emails: [] };
    entry.emails.push(m.email);
    byCompany.set(m.company_id, entry);
  }

  let sent = 0;
  const errors: string[] = [];

  for (const [companyId, info] of byCompany) {
    const alerts = await computeAlerts(companyId);
    const critical = alerts.filter((a) => a.level === "danger" || a.level === "warning");
    if (critical.length === 0) continue;

    const { subject, html } = alertEmail(info.name, critical);
    for (const email of info.emails) {
      const res = await sendEmail(email, subject, html);
      if (res.ok) sent++;
      else if (!res.skipped) errors.push(`${email}: ${res.error}`);
    }
  }

  return NextResponse.json({ sent, companies: byCompany.size, errors });
}
