"use client";

import { useActionState, useEffect, useState } from "react";
import { saveAttendance } from "./actions";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Check, X, Clock, AlertTriangle } from "lucide-react";

interface TeamMember {
  id: string;
  full_name: string;
  role: string;
  is_active: boolean;
}

interface Team {
  id: string;
  name: string;
  chantier_id: string;
  team_members: TeamMember[];
}

interface AttendanceEntry {
  team_member_id: string;
  status: "present" | "absent" | "retard" | "demi_journee";
  hours_worked: number;
  note: string;
}

const statusConfig = {
  present: { icon: Check, label: "Présent", color: "bg-green-500/20 text-green-400 border-green-500/30" },
  absent: { icon: X, label: "Absent", color: "bg-red-500/20 text-red-400 border-red-500/30" },
  retard: { icon: Clock, label: "Retard", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  demi_journee: { icon: AlertTriangle, label: "½ jour", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
};

const roleLabels: Record<string, string> = {
  chef_equipe: "Chef", ouvrier: "Ouvrier", apprenti: "Apprenti", manoeuvre: "Manoeuvre",
};

interface Props {
  chantiers: { value: string; label: string }[];
  teams: Team[];
}

export function AttendanceForm({ chantiers, teams }: Props) {
  const [state, formAction, pending] = useActionState(saveAttendance, null);
  const [chantierId, setChantierId] = useState(chantiers[0]?.value ?? "");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [entries, setEntries] = useState<Record<string, AttendanceEntry>>({});

  const filteredTeams = teams.filter((t) => t.chantier_id === chantierId);
  const allMembers = filteredTeams.flatMap((t) =>
    t.team_members.map((m) => ({ ...m, teamName: t.name }))
  );

  useEffect(() => {
    const newEntries: Record<string, AttendanceEntry> = {};
    for (const m of allMembers) {
      newEntries[m.id] = entries[m.id] ?? {
        team_member_id: m.id,
        status: "present" as const,
        hours_worked: 8,
        note: "",
      };
    }
    setEntries(newEntries);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chantierId]);

  function updateEntry(memberId: string, field: keyof AttendanceEntry, value: string | number) {
    setEntries((prev) => ({
      ...prev,
      [memberId]: {
        ...prev[memberId],
        [field]: value,
        ...(field === "status" && value === "absent" ? { hours_worked: 0 } : {}),
        ...(field === "status" && value === "demi_journee" ? { hours_worked: 4 } : {}),
        ...(field === "status" && value === "present" ? { hours_worked: 8 } : {}),
      },
    }));
  }

  function handleSubmit() {
    const data = {
      chantier_id: chantierId,
      attendance_date: date,
      entries: Object.values(entries),
    };
    const fd = new FormData();
    fd.set("data", JSON.stringify(data));
    formAction(fd);
  }

  const presentCount = Object.values(entries).filter((e) => e.status === "present" || e.status === "retard").length;

  return (
    <div className="space-y-4">
      <Card>
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Chantier"
            options={chantiers}
            value={chantierId}
            onChange={(e) => setChantierId(e.target.value)}
          />
          <Input
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </Card>

      {allMembers.length === 0 ? (
        <Card className="text-center text-zinc-500 py-8">
          Aucun membre actif sur ce chantier. Ajoutez des équipes d&apos;abord.
        </Card>
      ) : (
        <>
          <div className="flex items-center justify-between text-sm text-zinc-400">
            <span>{allMembers.length} membre{allMembers.length > 1 ? "s" : ""}</span>
            <span className="text-green-400">{presentCount} présent{presentCount > 1 ? "s" : ""}</span>
          </div>

          <div className="space-y-2">
            {filteredTeams.map((team) => (
              <div key={team.id} className="space-y-2">
                <h3 className="text-sm font-semibold text-zinc-300 mt-4">{team.name}</h3>
                {team.team_members.map((m) => {
                  const entry = entries[m.id];
                  if (!entry) return null;
                  return (
                    <Card key={m.id} className="flex flex-wrap items-center gap-3">
                      <div className="flex-1 min-w-[140px]">
                        <p className="text-sm font-medium text-white">{m.full_name}</p>
                        <p className="text-xs text-zinc-500">{roleLabels[m.role] ?? m.role}</p>
                      </div>
                      <div className="flex gap-1">
                        {(Object.keys(statusConfig) as Array<keyof typeof statusConfig>).map((s) => {
                          const cfg = statusConfig[s];
                          const Icon = cfg.icon;
                          const active = entry.status === s;
                          return (
                            <button
                              key={s}
                              type="button"
                              onClick={() => updateEntry(m.id, "status", s)}
                              className={`flex items-center gap-1 rounded-lg border px-2 py-1 text-xs transition-colors ${
                                active ? cfg.color : "border-zinc-700 text-zinc-500 hover:border-zinc-600"
                              }`}
                              title={cfg.label}
                            >
                              <Icon size={12} />
                              <span className="hidden sm:inline">{cfg.label}</span>
                            </button>
                          );
                        })}
                      </div>
                      <input
                        type="number"
                        min={0}
                        max={24}
                        step={0.5}
                        value={entry.hours_worked}
                        onChange={(e) => updateEntry(m.id, "hours_worked", parseFloat(e.target.value) || 0)}
                        className="w-16 rounded bg-zinc-800 px-2 py-1 text-center text-sm text-white border border-zinc-700"
                        title="Heures"
                      />
                    </Card>
                  );
                })}
              </div>
            ))}
          </div>

          {state && "success" in state && state.success && (
            <p className="text-sm text-green-400">Présences enregistrées !</p>
          )}
          {state && "error" in state && typeof state.error === "string" && (
            <p className="text-sm text-red-400">{state.error}</p>
          )}

          <Button onClick={handleSubmit} loading={pending} className="w-full">
            Enregistrer les présences
          </Button>
        </>
      )}
    </div>
  );
}
