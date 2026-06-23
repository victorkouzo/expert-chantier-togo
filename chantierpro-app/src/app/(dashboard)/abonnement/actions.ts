"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { PLANS } from "@/lib/plans";

const RequestPaymentSchema = z.object({
  plan: z.enum(["pro", "entreprise"]),
  billing_cycle: z.enum(["monthly", "yearly"]),
  provider: z.enum(["flooz", "tmoney", "wave", "orange_money", "card", "bank_transfer"]),
  phone: z.string().min(8).max(20).optional(),
  reference: z.string().max(100).optional(),
});

export async function requestSubscription(_prevState: unknown, formData: FormData) {
  // Seuls admin/directeur peuvent gérer l'abonnement
  const session = await requireRole(["admin", "directeur"]);

  const parsed = RequestPaymentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const plan = PLANS[parsed.data.plan];
  const amount = parsed.data.billing_cycle === "yearly" ? plan.priceYearly : plan.priceMonthly;
  const method = ["card"].includes(parsed.data.provider)
    ? "card"
    : parsed.data.provider === "bank_transfer"
    ? "bank_transfer"
    : "mobile_money";

  const supabase = await createClient();
  const { error } = await supabase.from("payments").insert({
    company_id: session.companyId,
    plan: parsed.data.plan,
    billing_cycle: parsed.data.billing_cycle,
    amount,
    method,
    provider: parsed.data.provider,
    phone: parsed.data.phone || null,
    reference: parsed.data.reference || null,
    status: "pending",
    requested_by: session.userId,
  });

  if (error) return { error: error.message };

  revalidatePath("/abonnement");
  return { success: true };
}
