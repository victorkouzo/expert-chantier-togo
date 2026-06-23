import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

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

  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const meta = user.user_metadata ?? {};
  const companyName = meta.company_name || (meta.full_name ? `${meta.full_name} SARL` : "Mon entreprise");

  const { data: company, error: coErr } = await adminClient
    .from("companies")
    .insert({ name: companyName, plan: "starter" })
    .select("id")
    .single();

  if (coErr || !company) {
    const { data: fallback } = await adminClient
      .from("companies")
      .select("id")
      .limit(1)
      .single();
    if (!fallback) {
      return NextResponse.json({ error: "Impossible de créer l'entreprise" }, { status: 500 });
    }
    const { error: profErr } = await adminClient.from("profiles").insert({
      id: user.id,
      email: user.email ?? "",
      full_name: meta.full_name ?? "",
      role: "directeur",
      phone: meta.phone ?? null,
      company_id: fallback.id,
    });
    if (profErr) {
      return NextResponse.json({ error: profErr.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  }

  const { error: profErr } = await adminClient.from("profiles").insert({
    id: user.id,
    email: user.email ?? "",
    full_name: meta.full_name ?? "",
    role: "directeur",
    phone: meta.phone ?? null,
    company_id: company.id,
  });

  if (profErr) {
    return NextResponse.json({ error: profErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
