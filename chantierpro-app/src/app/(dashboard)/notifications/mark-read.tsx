"use client";

import { Button } from "@/components/ui/button";
import { Check, CheckCheck } from "lucide-react";
import { markNotificationRead, markAllNotificationsRead } from "./actions";

export function MarkReadButton({ notificationId }: { notificationId: string }) {
  return (
    <form action={() => markNotificationRead(notificationId)}>
      <Button variant="ghost" size="sm" type="submit" title="Marquer comme lu">
        <Check size={14} />
      </Button>
    </form>
  );
}

export function MarkAllReadButton() {
  return (
    <form action={() => markAllNotificationsRead()}>
      <Button variant="secondary" size="sm" type="submit">
        <CheckCheck size={14} className="mr-1" /> Tout marquer lu
      </Button>
    </form>
  );
}
