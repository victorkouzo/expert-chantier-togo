"use client";

import { useActionState, useEffect, useState } from "react";
import { updateCompany } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

interface Props {
  company: { name: string; address: string; city: string; phone: string; email: string };
}

export function CompanyForm({ company }: Props) {
  const [state, formAction, pending] = useActionState(updateCompany, null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (state && "success" in state && state.success) {
      setMessage("Entreprise mise à jour !");
      const t = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(t);
    }
  }, [state]);

  return (
    <Card>
      <form action={formAction} className="space-y-4">
        <Input label="Nom" name="name" required defaultValue={company.name} />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Adresse" name="address" defaultValue={company.address} />
          <Input label="Ville" name="city" defaultValue={company.city} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Téléphone" name="phone" type="tel" defaultValue={company.phone} />
          <Input label="Email" name="email" type="email" defaultValue={company.email} />
        </div>

        {state && "error" in state && typeof state.error === "string" && (
          <p className="text-sm text-red-400">{state.error}</p>
        )}
        {message && <p className="text-sm text-green-400">{message}</p>}

        <Button type="submit" loading={pending}>Enregistrer</Button>
      </form>
    </Card>
  );
}
