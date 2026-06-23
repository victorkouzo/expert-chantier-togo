"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { createChantier } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useEffect } from "react";

export default function NewChantierPage() {
  const [state, formAction, pending] = useActionState(createChantier, null);
  const router = useRouter();

  useEffect(() => {
    if (state && "success" in state && state.success) {
      router.push("/chantiers");
    }
  }, [state, router]);

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-2xl font-bold text-white">Nouveau chantier</h1>

      <Card>
        <form action={formAction} className="space-y-4">
          <Input label="Nom du chantier" name="name" required />
          <Textarea label="Description" name="description" rows={3} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Adresse" name="address" required />
            <Input label="Ville" name="city" required placeholder="Lomé" />
          </div>
          <Input label="Budget (FCFA)" name="budget" type="number" required min={0} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Date de début" name="start_date" type="date" required />
            <Input label="Date de fin (optionnel)" name="end_date" type="date" />
          </div>

          {state && "error" in state && typeof state.error === "string" && (
            <p className="text-sm text-red-400">{state.error}</p>
          )}

          <Button type="submit" loading={pending} className="w-full">
            Créer le chantier
          </Button>
        </form>
      </Card>
    </div>
  );
}
