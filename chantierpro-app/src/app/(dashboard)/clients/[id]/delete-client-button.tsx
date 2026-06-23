"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteClient } from "../actions";

export function DeleteClientButton({ clientId }: { clientId: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Supprimer ce client ? Les chantiers associés ne seront pas supprimés.")) return;
    await deleteClient(clientId);
    router.push("/clients");
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleDelete}>
      <Trash2 size={16} className="text-red-400" />
    </Button>
  );
}
