"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const CreateExpenseSchema = z.object({
  chantier_id: z.string().uuid(),
  category: z.enum(["materiaux", "main_oeuvre", "transport", "location_engin", "autre"]),
  description: z.string().min(2).max(500),
  amount: z.coerce.number().positive(),
  expense_date: z.string(),
});

export async function createExpense(_prevState: unknown, formData: FormData) {
  const parsed = CreateExpenseSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié" };

  const { error } = await supabase.from("expenses").insert({
    ...parsed.data,
    author_id: user.id,
  });

  if (error) return { error: error.message };

  revalidatePath("/depenses");
  revalidatePath("/dashboard");
  return { success: true };
}
