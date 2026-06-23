import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { User, Mail, Phone, Building, Shield } from "lucide-react";
import { ProfileForm } from "./profile-form";
import { PasswordForm } from "./password-form";

const roleLabels: Record<string, string> = {
  admin: "Administrateur",
  chef_chantier: "Chef de chantier",
  conducteur_travaux: "Conducteur de travaux",
  ouvrier: "Ouvrier",
  client: "Client / Maître d'ouvrage",
};

export default async function ProfilPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-white">Mon profil</h1>

      <Card className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20 text-green-400">
            <User size={28} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">{profile?.full_name || "—"}</h2>
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <Shield size={14} />
              {roleLabels[profile?.role ?? ""] ?? profile?.role}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 border-t border-zinc-800 pt-4 sm:grid-cols-2">
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <Mail size={14} /> {user.email}
          </div>
          {profile?.phone && (
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <Phone size={14} /> {profile.phone}
            </div>
          )}
          {profile?.company && (
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <Building size={14} /> {profile.company}
            </div>
          )}
        </div>
      </Card>

      <ProfileForm profile={{
        full_name: profile?.full_name ?? "",
        phone: profile?.phone ?? "",
        company: profile?.company ?? "",
      }} />

      <PasswordForm />
    </div>
  );
}
