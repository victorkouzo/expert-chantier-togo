"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { inviteMember } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";

const roleOptions = [
  { value: "directeur", label: "Directeur" },
  { value: "conducteur_travaux", label: "Conducteur de travaux" },
  { value: "chef_chantier", label: "Chef de chantier" },
  { value: "ouvrier", label: "Ouvrier" },
  { value: "client", label: "Client / Maître d'ouvrage" },
];

export function InviteForm() {
  const [state, formAction, pending] = useActionState(inviteMember, null);
  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (state && "success" in state && state.success) {
      setMessage("Invitation créée. Communiquez le lien à l'invité.");
      router.refresh();
      const t = setTimeout(() => setMessage(""), 4000);
      return () => clearTimeout(t);
    }
  }, [state, router]);

  return (
    <Card>
      <form action={formAction} className="space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Input label="Email de l'invité" name="email" type="email" required className="sm:col-span-2" />
          <Select label="Rôle" name="role" options={roleOptions} defaultValue="chef_chantier" />
        </div>

        {state && "error" in state && typeof state.error === "string" && (
          <p className="text-sm text-red-400">{state.error}</p>
        )}
        {message && <p className="text-sm text-green-400">{message}</p>}

        <Button type="submit" loading={pending} size="sm">Inviter</Button>
      </form>
    </Card>
  );
}
