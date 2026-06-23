import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getPlan } from "@/lib/plans";
import { getAnthropic, AI_MODEL } from "@/lib/anthropic";
import { buildCompanyContext } from "@/lib/ai-context";
import { z } from "zod";

const BodySchema = z.object({
  period: z.enum(["hebdomadaire", "mensuel"]),
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
  const period = parsed.data.period;

  const systemPrompt = `Tu es un directeur de travaux expérimenté qui rédige des rapports de synthèse pour l'entreprise BTP "${session.companyName}" au Togo.
Rédige en français professionnel. Les montants sont en FCFA.`;

  const userPrompt = `À partir des données ci-dessous, rédige un RAPPORT ${period.toUpperCase()} structuré avec les sections suivantes (en markdown) :

## Synthèse générale
Vue d'ensemble de l'activité.

## Avancement des chantiers
État de chaque chantier actif, avancement, points clés.

## Situation financière
Analyse des dépenses par rapport aux budgets, alertes de dépassement.

## Points d'attention et risques
Problèmes signalés, retards potentiels, recommandations.

## Recommandations
Actions prioritaires pour la période à venir.

DONNÉES :
${context}`;

  try {
    const response = await anthropic.messages.create({
      model: AI_MODEL,
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const text = response.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { text: string }).text)
      .join("\n");

    return NextResponse.json({ report: text });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur IA";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
