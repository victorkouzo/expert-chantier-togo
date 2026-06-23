"use client";

import { revokeInvitation } from "./actions";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export function RevokeInviteButton({ invitationId }: { invitationId: string }) {
  return (
    <form action={() => revokeInvitation(invitationId)}>
      <Button variant="ghost" size="sm" type="submit" title="Révoquer">
        <X size={14} className="text-red-400" />
      </Button>
    </form>
  );
}
