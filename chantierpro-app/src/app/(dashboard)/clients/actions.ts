"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const ClientSchema = z.object({
  name: z.string().min(2).max(200),
  contact_name: z.string().max(200).optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().max(30).optional(),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  notes: z.string().max(2000).optional(),
});

export async function createClientAction(_prev: unknown, formData: FormData) {
  const session = await requireSession();
  const parsed = ClientSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { error } = await supabase.from("clients").insert({
    ...parsed.data,
    email: parsed.data.email || null,
    company_id: session.companyId,
  });

  if (error) return { error: error.message };

  revalidatePath("/clients");
  return { success: true };
}

export async function updateClientAction(clientId: string, _prev: unknown, formData: FormData) {
  await requireSession();
  const parsed = ClientSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { error } = await supabase
    .from("clients")
    .update({ ...parsed.data, email: parsed.data.email || null })
    .eq("id", clientId);

  if (error) return { error: error.message };

  revalidatePath("/clients");
  revalidatePath(`/clients/${clientId}`);
  return { success: true };
}

export async function deleteClient(clientId: string) {
  await requireSession();
  const supabase = await createClient();
  await supabase.from("clients").delete().eq("id", clientId);
  revalidatePath("/clients");
}
