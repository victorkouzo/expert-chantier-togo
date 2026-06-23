"use client";

import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Flag, Trash2, Calendar } from "lucide-react";
import { updateTaskStatus, deleteTask } from "./actions";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const priorityConfig: Record<string, { color: string; label: string }> = {
  basse: { color: "text-zinc-400", label: "Basse" },
  normale: { color: "text-blue-400", label: "Normale" },
  haute: { color: "text-orange-400", label: "Haute" },
  urgente: { color: "text-red-400", label: "Urgente" },
};

const statusOptions = [
  { value: "a_faire", label: "À faire" },
  { value: "en_cours", label: "En cours" },
  { value: "termine", label: "Terminé" },
  { value: "bloque", label: "Bloqué" },
];

interface TaskCardProps {
  task: {
    id: string;
    title: string;
    description: string | null;
    status: string;
    priority: string;
    progress: number;
    start_date: string | null;
    end_date: string | null;
    chantiers: unknown;
    teams: unknown;
  };
}

export function TaskCard({ task }: TaskCardProps) {
  const p = priorityConfig[task.priority] ?? priorityConfig.normale;
  const chantierName = task.chantiers && typeof task.chantiers === "object"
    ? (task.chantiers as { name: string }).name : null;
  const teamName = task.teams && typeof task.teams === "object"
    ? (task.teams as { name: string }).name : null;

  function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value;
    const progress = newStatus === "termine" ? 100 : newStatus === "a_faire" ? 0 : task.progress;
    updateTaskStatus(task.id, newStatus, progress);
  }

  return (
    <Card className="space-y-2 p-4">
      <div className="flex items-start justify-between">
        <h3 className="text-sm font-medium text-white">{task.title}</h3>
        <Flag size={12} className={p.color} />
      </div>

      {task.description && (
        <p className="text-xs text-zinc-500 line-clamp-2">{task.description}</p>
      )}

      <div className="flex flex-wrap gap-1 text-xs">
        {chantierName && <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-zinc-400">{chantierName}</span>}
        {teamName && <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-zinc-400">{teamName}</span>}
      </div>

      {(task.start_date || task.end_date) && (
        <p className="flex items-center gap-1 text-xs text-zinc-500">
          <Calendar size={11} />
          {task.start_date && format(new Date(task.start_date), "d MMM", { locale: fr })}
          {task.start_date && task.end_date && " → "}
          {task.end_date && format(new Date(task.end_date), "d MMM", { locale: fr })}
        </p>
      )}

      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <span>Progression</span>
          <span>{task.progress}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
          <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${task.progress}%` }} />
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <select
          value={task.status}
          onChange={handleStatusChange}
          className="flex-1 rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs text-white"
        >
          {statusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <form action={() => deleteTask(task.id)}>
          <Button variant="ghost" size="sm" type="submit"><Trash2 size={12} className="text-red-400" /></Button>
        </form>
      </div>
    </Card>
  );
}
