"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";
import { checkChantierLimit } from "@/lib/billing";

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

  const session = await requireSession();

  // Limite par plan
  const limit = await checkChantierLimit(session.companyId, session.plan);
  if (!limit.allowed) {
    return {
      error: `Limite atteinte : votre plan ${limit.plan.name} autorise ${limit.limit} chantier${limit.limit > 1 ? "s" : ""}. Passez à un plan supérieur pour en créer davantage.`,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("chantiers").insert({
    ...parsed.data,
    owner_id: session.userId,
    company_id: session.companyId,
    status: "planifie",
  });

  if (error) return { error: error.message };

  revalidatePath("/chantiers");
  revalidatePath("/dashboard");
  return { success: true };
}
