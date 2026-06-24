import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié", detail: authErr?.message }, { status: 401 });
  }

  const { data: existing } = await supabase
    .from("profiles")
    .select("id, company_id")
    .eq("id", user.id)
    .single();

  if (existing?.company_id) {
    return NextResponse.json({ ok: true, message: "Profil existe déjà" });
  }

  const meta = user.user_metadata ?? {};
  const companyName = meta.company_name || (meta.full_name ? `${meta.full_name} SARL` : "Mon entreprise");

  let companyId: string | null = null;

  // Try to create a new company with all required fields
  const { data: newCo, error: coErr } = await supabase
    .from("companies")
    .insert({
      name: companyName,
      plan: "starter",
      max_chantiers: 1,
      max_users: 5,
      city: "Lomé",
    })
    .select("id")
    .single();

  if (newCo) {
    companyId = newCo.id;
  } else {
    // Fallback: use any existing company
    const { data: fallback } = await supabase
      .from("companies")
      .select("id")
      .limit(1)
      .single();
    if (fallback) companyId = fallback.id;
  }

  if (!companyId) {
    return NextResponse.json({
      error: "Impossible de créer l'entreprise",
      detail: coErr?.message,
      code: coErr?.code,
    }, { status: 500 });
  }

  if (existing && !existing.company_id) {
    // Profile exists but no company_id — update it
    const { error: upErr } = await supabase
      .from("profiles")
      .update({ company_id: companyId })
      .eq("id", user.id);
    if (upErr) {
      return NextResponse.json({ error: upErr.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  }

  // Create profile
  const { error: profErr } = await supabase.from("profiles").insert({
    id: user.id,
    email: user.email ?? "",
    full_name: meta.full_name ?? "",
    role: "directeur",
    phone: meta.phone ?? null,
    company_id: companyId,
  });

  if (profErr) {
    return NextResponse.json({ error: profErr.message, code: profErr.code }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
