"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createDailyReport } from "../actions";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

const weatherOptions = [
  { value: "soleil", label: "Soleil" },
  { value: "nuageux", label: "Nuageux" },
  { value: "pluie", label: "Pluie" },
  { value: "orage", label: "Orage" },
];

export default function NewRapportPage() {
  const [state, formAction, pending] = useActionState(createDailyReport, null);
  const [chantiers, setChantiers] = useState<{ value: string; label: string }[]>([]);
  const router = useRouter();

  useEffect(() => {
    createClient()
      .from("chantiers")
      .select("id, name")
      .eq("status", "en_cours")
      .then(({ data }) => {
        setChantiers(
          (data ?? []).map((c) => ({ value: c.id, label: c.name }))
        );
      });
  }, []);

  useEffect(() => {
    if (state && "success" in state && state.success) {
      router.push("/rapports");
    }
  }, [state, router]);

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-2xl font-bold text-white">Nouveau rapport journalier</h1>

      <Card>
        <form action={formAction} className="space-y-4">
          <Select label="Chantier" name="chantier_id" options={chantiers} required />
          <Input label="Date du rapport" name="report_date" type="date" required defaultValue={new Date().toISOString().split("T")[0]} />

          <div className="grid grid-cols-2 gap-4">
            <Select label="Météo" name="weather" options={weatherOptions} />
            <Input label="Température (°C)" name="temperature" type="number" />
          </div>

          <Input label="Ouvriers présents" name="workers_present" type="number" required min={0} />
          <Textarea label="Résumé des travaux" name="summary" rows={3} required />
          <Textarea label="Tâches accomplies" name="tasks_completed" rows={3} required />
          <Textarea label="Problèmes rencontrés (optionnel)" name="issues" rows={2} />

          {state && "error" in state && typeof state.error === "string" && (
            <p className="text-sm text-red-400">{state.error}</p>
          )}

          <Button type="submit" loading={pending} className="w-full">
            Enregistrer le rapport
          </Button>
        </form>
      </Card>
    </div>
  );
}
