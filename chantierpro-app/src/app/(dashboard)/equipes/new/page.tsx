"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createTeam } from "../actions";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";

const specialtyOptions = [
  { value: "general", label: "Général" },
  { value: "maconnerie", label: "Maçonnerie" },
  { value: "electricite", label: "Électricité" },
  { value: "plomberie", label: "Plomberie" },
  { value: "peinture", label: "Peinture" },
  { value: "charpente", label: "Charpente" },
  { value: "ferraillage", label: "Ferraillage" },
  { value: "coffrage", label: "Coffrage" },
  { value: "finition", label: "Finition" },
  { value: "autre", label: "Autre" },
];

export default function NewEquipePage() {
  const [state, formAction, pending] = useActionState(createTeam, null);
  const [chantiers, setChantiers] = useState<{ value: string; label: string }[]>([]);
  const router = useRouter();

  useEffect(() => {
    createClient()
      .from("chantiers")
      .select("id, name")
      .then(({ data }) => {
        setChantiers((data ?? []).map((c) => ({ value: c.id, label: c.name })));
      });
  }, []);

  useEffect(() => {
    if (state && "success" in state && state.success) router.push("/equipes");
  }, [state, router]);

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-2xl font-bold text-white">Nouvelle équipe</h1>
      <Card>
        <form action={formAction} className="space-y-4">
          <Input label="Nom de l'équipe" name="name" required placeholder="Ex: Équipe maçonnerie A" />
          <Select label="Chantier" name="chantier_id" options={chantiers} required />
          <Select label="Spécialité" name="specialty" options={specialtyOptions} />

          {state && "error" in state && typeof state.error === "string" && (
            <p className="text-sm text-red-400">{state.error}</p>
          )}

          <Button type="submit" loading={pending} className="w-full">Créer l&apos;équipe</Button>
        </form>
      </Card>
    </div>
  );
}
