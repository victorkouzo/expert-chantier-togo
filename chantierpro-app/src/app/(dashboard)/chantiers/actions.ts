"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const CreateChantierSchema = z.object({
  name: z.string().min(2).max(200),
  reference: z.string().max(50).optional(),
  client_id: z.string().uuid().optional().or(z.literal("")),
  description: z.string().max(2000).optional(),
  address: z.string().min(2),
  city: z.string().min(2),
  latitude: z.coerce.number().min(-90).max(90).optional().or(z.literal("")),
  longitude: z.coerce.number().min(-180).max(180).optional().or(z.literal("")),
  budget: z.coerce.number().positive(),
  start_date: z.string(),
  end_date: z.string().optional(),
});

export async function createChantier(_prevState: unknown, formData: FormData) {
  const session = await requireSession();
  const raw = Object.fromEntries(formData);
  if (raw.client_id === "") delete raw.client_id;
  if (raw.latitude === "") delete raw.latitude;
  if (raw.longitude === "") delete raw.longitude;

  const parsed = CreateChantierSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const insertData: Record<string, unknown> = {
    ...parsed.data,
    owner_id: session.userId,
    company_id: session.companyId,
    status: "planifie",
  };
  if (!insertData.client_id) delete insertData.client_id;
  if (insertData.latitude === "" || insertData.latitude == null) delete insertData.latitude;
  if (insertData.longitude === "" || insertData.longitude == null) delete insertData.longitude;
  if (!insertData.reference) delete insertData.reference;

  const { error } = await supabase.from("chantiers").insert(insertData);

  if (error) return { error: error.message };

  revalidatePath("/chantiers");
  revalidatePath("/dashboard");
  return { success: true };
}
