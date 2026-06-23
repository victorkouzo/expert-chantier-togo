"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";

const CreateReportSchema = z.object({
  chantier_id: z.string().uuid(),
  report_date: z.string(),
  weather: z.enum(["soleil", "nuageux", "pluie", "orage"]),
  temperature: z.coerce.number().optional(),
  summary: z.string().min(5).max(5000),
  workers_present: z.coerce.number().int().min(0),
  tasks_completed: z.string().min(2),
  issues: z.string().max(5000).optional(),
});

export async function createDailyReport(_prevState: unknown, formData: FormData) {
  const parsed = CreateReportSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const session = await requireSession();

  const photos = (() => { try { return JSON.parse(formData.get("photos") as string ?? "[]"); } catch { return []; } })();
  const tradeDetails = (() => { try { return JSON.parse(formData.get("trade_details") as string ?? "[]"); } catch { return []; } })();
  const signatureData = formData.get("signature_data") as string || null;

  const supabase = await createClient();
  const { error } = await supabase.from("daily_reports").insert({
    ...parsed.data,
    author_id: session.userId,
    photos,
    trade_details: tradeDetails,
    signature_data: signatureData,
  });

  if (error) return { error: error.message };

  revalidatePath("/rapports");
  revalidatePath("/dashboard");
  return { success: true };
}
