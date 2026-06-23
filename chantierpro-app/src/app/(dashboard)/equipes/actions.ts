"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const CreateTeamSchema = z.object({
  chantier_id: z.string().uuid(),
  name: z.string().min(2).max(200),
  specialty: z.enum(["general", "maconnerie", "electricite", "plomberie", "peinture", "charpente", "ferraillage", "coffrage", "finition", "autre"]),
});

export async function createTeam(_prevState: unknown, formData: FormData) {
  const parsed = CreateTeamSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié" };

  const { error } = await supabase.from("teams").insert(parsed.data);
  if (error) return { error: error.message };

  revalidatePath("/equipes");
  return { success: true };
}

const AddMemberSchema = z.object({
  team_id: z.string().uuid(),
  full_name: z.string().min(2).max(200),
  role: z.enum(["chef_equipe", "ouvrier", "apprenti", "manoeuvre"]),
  phone: z.string().max(20).optional(),
  daily_rate: z.coerce.number().min(0),
});

export async function addTeamMember(_prevState: unknown, formData: FormData) {
  const parsed = AddMemberSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { error } = await supabase.from("team_members").insert(parsed.data);
  if (error) return { error: error.message };

  revalidatePath(`/equipes`);
  return { success: true };
}

export async function toggleMemberActive(memberId: string, isActive: boolean) {
  const supabase = await createClient();
  await supabase.from("team_members").update({ is_active: !isActive }).eq("id", memberId);
  revalidatePath("/equipes");
}

export async function deleteTeamMember(memberId: string) {
  const supabase = await createClient();
  await supabase.from("team_members").delete().eq("id", memberId);
  revalidatePath("/equipes");
}
