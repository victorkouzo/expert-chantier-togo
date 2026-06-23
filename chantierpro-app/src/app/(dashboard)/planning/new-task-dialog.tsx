"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createTask } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Plus, X } from "lucide-react";

const priorityOptions = [
  { value: "basse", label: "Basse" },
  { value: "normale", label: "Normale" },
  { value: "haute", label: "Haute" },
  { value: "urgente", label: "Urgente" },
];

interface Props {
  chantiers: { value: string; label: string }[];
  teams: { value: string; label: string }[];
}

export function NewTaskDialog({ chantiers, teams }: Props) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createTask, null);
  const router = useRouter();

  useEffect(() => {
    if (state && "success" in state && state.success) {
      setOpen(false);
      router.refresh();
    }
  }, [state, router]);

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}><Plus size={16} className="mr-2" />Nouvelle tâche</Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <Card className="w-full max-w-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Nouvelle tâche</h2>
          <button onClick={() => setOpen(false)} className="text-zinc-500 hover:text-white"><X size={20} /></button>
        </div>
        <form action={formAction} className="space-y-4">
          <Input label="Titre" name="title" required />
          <Textarea label="Description (optionnel)" name="description" rows={2} />
          <Select label="Chantier" name="chantier_id" options={chantiers} required />
          <Select label="Équipe assignée (optionnel)" name="assigned_team_id" options={[{ value: "", label: "— Aucune —" }, ...teams]} />
          <Select label="Priorité" name="priority" options={priorityOptions} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Début" name="start_date" type="date" />
            <Input label="Fin" name="end_date" type="date" />
          </div>

          {state && "error" in state && typeof state.error === "string" && (
            <p className="text-sm text-red-400">{state.error}</p>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setOpen(false)}>Annuler</Button>
            <Button type="submit" loading={pending}>Créer la tâche</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
