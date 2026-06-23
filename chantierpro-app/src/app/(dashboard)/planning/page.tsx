import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, Flag } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { TaskCard } from "./task-card";
import { NewTaskDialog } from "./new-task-dialog";

const columns = [
  { status: "a_faire", label: "À faire", color: "border-blue-500" },
  { status: "en_cours", label: "En cours", color: "border-yellow-500" },
  { status: "termine", label: "Terminé", color: "border-green-500" },
  { status: "bloque", label: "Bloqué", color: "border-red-500" },
];

export default async function PlanningPage() {
  const supabase = await createClient();

  const [{ data: tasks }, { data: chantiers }, { data: teams }] = await Promise.all([
    supabase.from("tasks").select("*, chantiers(name), teams(name)").order("created_at", { ascending: false }),
    supabase.from("chantiers").select("id, name"),
    supabase.from("teams").select("id, name"),
  ]);

  const allTasks = tasks ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Planning</h1>
        <NewTaskDialog chantiers={(chantiers ?? []).map(c => ({ value: c.id, label: c.name }))} teams={(teams ?? []).map(t => ({ value: t.id, label: t.name }))} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        {columns.map(({ status, label, color }) => {
          const columnTasks = allTasks.filter((t) => t.status === status);
          return (
            <div key={status} className="space-y-3">
              <div className={`flex items-center gap-2 border-b-2 pb-2 ${color}`}>
                <h2 className="text-sm font-semibold text-white">{label}</h2>
                <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">{columnTasks.length}</span>
              </div>
              {columnTasks.length === 0 ? (
                <p className="py-8 text-center text-xs text-zinc-600">Aucune tâche</p>
              ) : (
                columnTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
