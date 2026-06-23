"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { addTeamMember } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";

const roleOptions = [
  { value: "ouvrier", label: "Ouvrier" },
  { value: "chef_equipe", label: "Chef d'équipe" },
  { value: "apprenti", label: "Apprenti" },
  { value: "manoeuvre", label: "Manoeuvre" },
];

export function AddMemberForm({ teamId }: { teamId: string }) {
  const [state, formAction, pending] = useActionState(addTeamMember, null);
  const router = useRouter();

  useEffect(() => {
    if (state && "success" in state && state.success) router.refresh();
  }, [state, router]);

  return (
    <Card>
      <h3 className="mb-4 text-sm font-semibold text-zinc-300">Ajouter un membre</h3>
      <form action={formAction} className="space-y-3">
        <input type="hidden" name="team_id" value={teamId} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Nom complet" name="full_name" required />
          <Select label="Rôle" name="role" options={roleOptions} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Téléphone" name="phone" type="tel" />
          <Input label="Tarif journalier (FCFA)" name="daily_rate" type="number" min={0} defaultValue="3000" />
        </div>

        {state && "error" in state && typeof state.error === "string" && (
          <p className="text-sm text-red-400">{state.error}</p>
        )}

        <Button type="submit" loading={pending} size="sm">Ajouter</Button>
      </form>
    </Card>
  );
}
