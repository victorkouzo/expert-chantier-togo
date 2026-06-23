"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createExpense } from "../actions";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

const categoryOptions = [
  { value: "materiaux", label: "Matériaux" },
  { value: "main_oeuvre", label: "Main d'oeuvre" },
  { value: "transport", label: "Transport" },
  { value: "location_engin", label: "Location engin" },
  { value: "autre", label: "Autre" },
];

export default function NewDepensePage() {
  const [state, formAction, pending] = useActionState(createExpense, null);
  const [chantiers, setChantiers] = useState<{ value: string; label: string }[]>([]);
  const router = useRouter();

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
      router.push("/depenses");
    }
  }, [state, router]);

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-2xl font-bold text-white">Nouvelle dépense</h1>

      <Card>
        <form action={formAction} className="space-y-4">
          <Select label="Chantier" name="chantier_id" options={chantiers} required />
          <Select label="Catégorie" name="category" options={categoryOptions} required />
          <Textarea label="Description" name="description" rows={2} required />
          <Input label="Montant (FCFA)" name="amount" type="number" required min={1} />
          <Input label="Date" name="expense_date" type="date" required defaultValue={new Date().toISOString().split("T")[0]} />

          {state && "error" in state && typeof state.error === "string" && (
            <p className="text-sm text-red-400">{state.error}</p>
          )}

          <Button type="submit" loading={pending} className="w-full">
            Enregistrer la dépense
          </Button>
        </form>
      </Card>
    </div>
  );
}
