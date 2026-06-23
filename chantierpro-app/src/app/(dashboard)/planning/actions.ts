"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const CreateTaskSchema = z.object({
  chantier_id: z.string().uuid(),
  title: z.string().min(2).max(300),
  description: z.string().max(2000).optional(),
  priority: z.enum(["basse", "normale", "haute", "urgente"]),
  assigned_team_id: z.string().uuid().optional().or(z.literal("")),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});

export async function createTask(_prevState: unknown, formData: FormData) {
  const raw = Object.fromEntries(formData);
  if (raw.assigned_team_id === "") delete raw.assigned_team_id;
  const parsed = CreateTaskSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié" };

  const insertData: Record<string, unknown> = {
    ...parsed.data,
    status: "a_faire",
    progress: 0,
  };
  if (!insertData.assigned_team_id) delete insertData.assigned_team_id;

  const { error } = await supabase.from("tasks").insert(insertData);
  if (error) return { error: error.message };

  revalidatePath("/planning");
  return { success: true };
}

export async function updateTaskStatus(taskId: string, status: string, progress: number) {
  const supabase = await createClient();
  await supabase.from("tasks").update({ status, progress }).eq("id", taskId);
  revalidatePath("/planning");
}

export async function deleteTask(taskId: string) {
  const supabase = await createClient();
  await supabase.from("tasks").delete().eq("id", taskId);
  revalidatePath("/planning");
}
