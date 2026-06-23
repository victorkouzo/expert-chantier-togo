"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientAction } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

export default function NewClientPage() {
  const [state, formAction, pending] = useActionState(createClientAction, null);
  const router = useRouter();

  useEffect(() => {
    if (state && "success" in state && state.success) router.push("/clients");
  }, [state, router]);

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-2xl font-bold text-white">Nouveau client</h1>
      <Card>
        <form action={formAction} className="space-y-4">
          <Input label="Nom / Raison sociale" name="name" required placeholder="Ex: Société X SARL" />
          <Input label="Personne de contact" name="contact_name" placeholder="Ex: M. Dupont" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Téléphone" name="phone" type="tel" placeholder="+228 90 00 00 00" />
            <Input label="Email" name="email" type="email" placeholder="contact@exemple.com" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Adresse" name="address" />
            <Input label="Ville" name="city" defaultValue="Lomé" />
          </div>
          <Textarea label="Notes (optionnel)" name="notes" rows={3} />

          {state && "error" in state && typeof state.error === "string" && (
            <p className="text-sm text-red-400">{state.error}</p>
          )}

          <Button type="submit" loading={pending} className="w-full">
            Créer le client
          </Button>
        </form>
      </Card>
    </div>
  );
}
