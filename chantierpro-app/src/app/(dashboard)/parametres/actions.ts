"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireSession, requireRole } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const CompanySchema = z.object({
  name: z.string().min(2).max(200),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  phone: z.string().max(30).optional(),
  email: z.string().email().optional().or(z.literal("")),
});

export async function updateCompany(_prev: unknown, formData: FormData) {
  const session = await requireRole(["admin", "directeur"]);
  const parsed = CompanySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { error } = await supabase
    .from("companies")
    .update({ ...parsed.data, email: parsed.data.email || null })
    .eq("id", session.companyId);

  if (error) return { error: error.message };

  revalidatePath("/parametres");
  return { success: true };
}

const InviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["directeur", "conducteur_travaux", "chef_chantier", "ouvrier", "client"]),
});

export async function inviteMember(_prev: unknown, formData: FormData) {
  const session = await requireRole(["admin", "directeur", "conducteur_travaux"]);
  const parsed = InviteSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { error } = await supabase.from("invitations").insert({
    company_id: session.companyId,
    email: parsed.data.email,
    role: parsed.data.role,
    invited_by: session.userId,
  });

  if (error) return { error: error.message };

  revalidatePath("/parametres");
  return { success: true };
}

export async function revokeInvitation(invitationId: string) {
  await requireRole(["admin", "directeur", "conducteur_travaux"]);
  const supabase = await createClient();
  await supabase.from("invitations").delete().eq("id", invitationId);
  revalidatePath("/parametres");
}

export async function updateMemberRole(memberId: string, newRole: string) {
  const session = await requireRole(["admin", "directeur"]);
  const supabase = await createClient();
  await supabase
    .from("profiles")
    .update({ role: newRole })
    .eq("id", memberId)
    .eq("company_id", session.companyId);
  revalidatePath("/parametres");
}
