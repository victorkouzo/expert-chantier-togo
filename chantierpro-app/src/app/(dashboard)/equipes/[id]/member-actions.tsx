"use client";

import { toggleMemberActive, deleteTeamMember } from "../actions";
import { Button } from "@/components/ui/button";
import { UserX, UserCheck, Trash2 } from "lucide-react";

export function MemberActions({ memberId, isActive }: { memberId: string; isActive: boolean }) {
  return (
    <div className="flex items-center gap-1">
      <form action={() => toggleMemberActive(memberId, isActive)}>
        <Button variant="ghost" size="sm" type="submit" title={isActive ? "Désactiver" : "Activer"}>
          {isActive ? <UserX size={14} /> : <UserCheck size={14} />}
        </Button>
      </form>
      <form action={() => deleteTeamMember(memberId)}>
        <Button variant="ghost" size="sm" type="submit" title="Supprimer">
          <Trash2 size={14} className="text-red-400" />
        </Button>
      </form>
    </div>
  );
}
