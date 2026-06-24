import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .single();

  if (existing) {
    return NextResponse.json({ ok: true, message: "Profil existe déjà" });
  }

  const meta = user.user_metadata ?? {};
  const companyName = meta.company_name || (meta.full_name ? `${meta.full_name} SARL` : "Mon entreprise");

  let companyId: string | null = null;

  const { data: newCo } = await supabase
    .from("companies")
    .insert({ name: companyName, plan: "starter" })
    .select("id")
    .single();

  if (newCo) {
    companyId = newCo.id;
  } else {
    const { data: fallback } = await supabase
      .from("companies")
      .select("id")
      .limit(1)
      .single();
    if (fallback) companyId = fallback.id;
  }

  if (!companyId) {
    return NextResponse.json({ error: "Impossible de créer l'entreprise. Vérifiez les policies RLS." }, { status: 500 });
  }

  const { error: profErr } = await supabase.from("profiles").insert({
    id: user.id,
    email: user.email ?? "",
    full_name: meta.full_name ?? "",
    role: "directeur",
    phone: meta.phone ?? null,
    company_id: companyId,
  });

  if (profErr) {
    return NextResponse.json({ error: profErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
