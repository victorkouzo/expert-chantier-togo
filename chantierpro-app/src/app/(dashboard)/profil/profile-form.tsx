"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

interface Props {
  profile: { full_name: string; phone: string; company: string };
}

export function ProfileForm({ profile }: Props) {
  const [fullName, setFullName] = useState(profile.full_name);
  const [phone, setPhone] = useState(profile.phone);
  const [company, setCompany] = useState(profile.company);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, phone, company })
      .eq("id", user.id);

    setLoading(false);
    if (error) {
      setMessage("Erreur : " + error.message);
    } else {
      setMessage("Profil mis à jour !");
      router.refresh();
    }
  }

  return (
    <Card>
      <h3 className="mb-4 text-sm font-semibold text-zinc-300">Modifier le profil</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Nom complet" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Téléphone" value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" />
          <Input label="Entreprise" value={company} onChange={(e) => setCompany(e.target.value)} />
        </div>

        {message && (
          <p className={`text-sm ${message.startsWith("Erreur") ? "text-red-400" : "text-green-400"}`}>
            {message}
          </p>
        )}

        <Button type="submit" loading={loading}>Enregistrer</Button>
      </form>
    </Card>
  );
}
