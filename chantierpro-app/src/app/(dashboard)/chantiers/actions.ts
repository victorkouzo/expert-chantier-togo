"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const CreateChantierSchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().max(2000).optional(),
  address: z.string().min(2),
  city: z.string().min(2),
  budget: z.coerce.number().positive(),
  start_date: z.string(),
  end_date: z.string().optional(),
});

export async function createChantier(_prevState: unknown, formData: FormData) {
  const parsed = CreateChantierSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié" };

  const { error } = await supabase.from("chantiers").insert({
    ...parsed.data,
    owner_id: user.id,
    status: "planifie",
  });

  if (error) return { error: error.message };

  revalidatePath("/chantiers");
  revalidatePath("/dashboard");
  return { success: true };
}
