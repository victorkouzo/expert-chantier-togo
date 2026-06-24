"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";

const UpdatePaymentSchema = z.object({
  payment_id: z.string().uuid(),
  action: z.enum(["confirm", "reject"]),
});

export async function updatePaymentStatus(_prevState: unknown, formData: FormData) {
  await requireRole(["admin", "directeur"]);

  const parsed = UpdatePaymentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Données invalides" };

  const supabase = await createClient();
  const newStatus = parsed.data.action === "confirm" ? "confirmed" : "rejected";

  const { error } = await supabase
    .from("payments")
    .update({
      status: newStatus,
      confirmed_at: parsed.data.action === "confirm" ? new Date().toISOString() : null,
    })
    .eq("id", parsed.data.payment_id)
    .eq("status", "pending");

  if (error) return { error: error.message };

  if (parsed.data.action === "confirm") {
    const { data: payment } = await supabase
      .from("payments")
      .select("company_id, plan, billing_cycle")
      .eq("id", parsed.data.payment_id)
      .single();

    if (payment) {
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + (payment.billing_cycle === "yearly" ? 12 : 1));

      await supabase
        .from("companies")
        .update({
          plan: payment.plan,
          subscription_status: "active",
          billing_cycle: payment.billing_cycle,
          subscription_ends_at: endDate.toISOString(),
        })
        .eq("id", payment.company_id);
    }
  }

  revalidatePath("/admin/paiements");
  return { success: true, action: parsed.data.action };
}
