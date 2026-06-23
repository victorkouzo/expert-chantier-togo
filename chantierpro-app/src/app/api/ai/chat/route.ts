import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getPlan } from "@/lib/plans";
import { getAnthropic, AI_MODEL } from "@/lib/anthropic";
import { buildCompanyContext } from "@/lib/ai-context";
import { z } from "zod";

const BodySchema = z.object({
  messages: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string().min(1).max(4000),
  })).min(1).max(20),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const plan = getPlan(session.plan);
  if (!plan.limits.aiReports) {
    return NextResponse.json({ error: "Fonctionnalité IA réservée au plan Entreprise." }, { status: 403 });
  }

  const anthropic = getAnthropic();
  if (!anthropic) {
    return NextResponse.json({ error: "L'IA n'est pas configurée (clé API manquante)." }, { status: 503 });
  }

  const body = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Requête invalide" }, { status: 400 });

  const context = await buildCompanyContext(session.companyId);

  const systemPrompt = `Tu es l'assistant IA de ChantierPro, une plateforme de gestion de chantiers BTP au Togo.
Tu réponds en français, de façon concise et professionnelle, en t'appuyant UNIQUEMENT sur les données de l'entreprise "${session.companyName}" fournies ci-dessous.
Si une information n'est pas dans les données, dis-le clairement. Les montants sont en FCFA.

DONNÉES DE L'ENTREPRISE :
${context}`;

  try {
    const response = await anthropic.messages.create({
      model: AI_MODEL,
      max_tokens: 1024,
      system: systemPrompt,
      messages: parsed.data.messages,
    });

    const text = response.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { text: string }).text)
      .join("\n");

    return NextResponse.json({ reply: text });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur IA";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
