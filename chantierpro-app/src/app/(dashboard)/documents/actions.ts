"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const CreateDocumentSchema = z.object({
  chantier_id: z.string().uuid(),
  name: z.string().min(2).max(300),
  description: z.string().max(2000).optional(),
  category: z.enum(["contrat", "plan", "permis", "facture", "pv_reception", "rapport_inspection", "photo", "autre"]),
  file_url: z.string().url(),
  file_size: z.coerce.number().min(0).optional(),
  file_type: z.string().optional(),
});

export async function createDocument(_prevState: unknown, formData: FormData) {
  const parsed = CreateDocumentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié" };

  const { error } = await supabase.from("documents").insert({
    ...parsed.data,
    uploaded_by: user.id,
  });

  if (error) return { error: error.message };

  revalidatePath("/documents");
  return { success: true };
}

export async function deleteDocument(documentId: string) {
  const supabase = await createClient();
  await supabase.from("documents").delete().eq("id", documentId);
  revalidatePath("/documents");
}
