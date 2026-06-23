"use client";

import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteDocument } from "./actions";

export function DeleteDocButton({ documentId }: { documentId: string }) {
  return (
    <form action={() => deleteDocument(documentId)}>
      <Button variant="ghost" size="sm" type="submit"><Trash2 size={14} className="text-red-400" /></Button>
    </form>
  );
}
