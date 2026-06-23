"use client";

import { Suspense, useActionState, useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createDailyReport } from "../actions";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { PhotoUpload } from "@/components/photo-upload";

const weatherOptions = [
  { value: "soleil", label: "Soleil" },
  { value: "nuageux", label: "Nuageux" },
  { value: "pluie", label: "Pluie" },
  { value: "orage", label: "Orage" },
];

function NewRapportForm() {
  const [state, formAction, pending] = useActionState(createDailyReport, null);
  const [chantiers, setChantiers] = useState<{ value: string; label: string }[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const photosRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedChantier = searchParams.get("chantier") ?? "";

  useEffect(() => {
    createClient()
      .from("chantiers")
      .select("id, name")
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

  useEffect(() => {
    if (photosRef.current) {
      photosRef.current.value = JSON.stringify(photos);
    }
  }, [photos]);

  return (
    <Card>
      <form action={formAction} className="space-y-4">
        <Select label="Chantier" name="chantier_id" options={chantiers} required defaultValue={preselectedChantier} />
        <Input label="Date du rapport" name="report_date" type="date" required defaultValue={new Date().toISOString().split("T")[0]} />

        <div className="grid grid-cols-2 gap-4">
          <Select label="Météo" name="weather" options={weatherOptions} />
          <Input label="Température (°C)" name="temperature" type="number" />
        </div>

        <Input label="Ouvriers présents" name="workers_present" type="number" required min={0} />
        <Textarea label="Résumé des travaux" name="summary" rows={3} required />
        <Textarea label="Tâches accomplies" name="tasks_completed" rows={3} required />
        <Textarea label="Problèmes rencontrés (optionnel)" name="issues" rows={2} />

        <PhotoUpload
          bucket="chantier-photos"
          folder="rapports"
          onUpload={setPhotos}
        />
        <input ref={photosRef} type="hidden" name="photos" value="[]" />

        {state && "error" in state && typeof state.error === "string" && (
          <p className="text-sm text-red-400">{state.error}</p>
        )}

        <Button type="submit" loading={pending} className="w-full">
          Enregistrer le rapport
        </Button>
      </form>
    </Card>
  );
}

export default function NewRapportPage() {
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-2xl font-bold text-white">Nouveau rapport journalier</h1>
      <Suspense fallback={<Card className="animate-pulse h-96" />}>
        <NewRapportForm />
      </Suspense>
    </div>
  );
}
