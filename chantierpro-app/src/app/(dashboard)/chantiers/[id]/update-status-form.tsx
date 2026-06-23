"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Select } from "@/components/ui/select";

const statusOptions = [
  { value: "planifie", label: "Planifié" },
  { value: "en_cours", label: "En cours" },
  { value: "suspendu", label: "Suspendu" },
  { value: "termine", label: "Terminé" },
  { value: "annule", label: "Annulé" },
];

export function UpdateStatusForm({ chantierId, currentStatus }: { chantierId: string; currentStatus: string }) {
  const router = useRouter();

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const supabase = createClient();
    await supabase.from("chantiers").update({ status: e.target.value }).eq("id", chantierId);
    router.refresh();
  }

  return (
    <Select
      options={statusOptions}
      value={currentStatus}
      onChange={handleChange}
      className="w-40"
    />
  );
}
