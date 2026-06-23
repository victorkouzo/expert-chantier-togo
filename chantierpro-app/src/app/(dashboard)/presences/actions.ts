"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";

const SaveAttendanceSchema = z.object({
  chantier_id: z.string().uuid(),
  attendance_date: z.string(),
  entries: z.array(z.object({
    team_member_id: z.string().uuid(),
    status: z.enum(["present", "absent", "retard", "demi_journee"]),
    hours_worked: z.coerce.number().min(0).max(24),
    note: z.string().max(200).optional(),
  })),
});

export async function saveAttendance(_prevState: unknown, formData: FormData) {
  const session = await requireSession();

  const raw = formData.get("data") as string;
  let data;
  try { data = JSON.parse(raw); } catch { return { error: "Données invalides" }; }

  const parsed = SaveAttendanceSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();

  const rows = parsed.data.entries.map((e) => ({
    company_id: session.companyId,
    chantier_id: parsed.data.chantier_id,
    team_member_id: e.team_member_id,
    attendance_date: parsed.data.attendance_date,
    status: e.status,
    hours_worked: e.hours_worked,
    note: e.note || null,
    recorded_by: session.userId,
  }));

  const { error } = await supabase.from("attendances").upsert(rows, {
    onConflict: "team_member_id,attendance_date",
  });

  if (error) return { error: error.message };

  revalidatePath("/presences");
  return { success: true };
}
