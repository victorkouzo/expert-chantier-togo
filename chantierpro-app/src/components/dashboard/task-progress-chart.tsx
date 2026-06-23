"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface TaskProgressChartProps {
  data: { name: string; a_faire: number; en_cours: number; termine: number; bloque: number }[];
}

export function TaskProgressChart({ data }: TaskProgressChartProps) {
  if (data.length === 0) {
    return <p className="py-8 text-center text-sm text-zinc-600">Aucune tâche</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
        <XAxis dataKey="name" tick={{ fill: "#888", fontSize: 11 }} />
        <YAxis tick={{ fill: "#888", fontSize: 12 }} />
        <Tooltip
          contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: "8px" }}
          labelStyle={{ color: "#fff" }}
        />
        <Legend formatter={(value) => <span style={{ color: "#888", fontSize: 12 }}>{value}</span>} />
        <Bar dataKey="a_faire" name="À faire" fill="#3b82f6" stackId="a" radius={[0, 0, 0, 0]} />
        <Bar dataKey="en_cours" name="En cours" fill="#eab308" stackId="a" />
        <Bar dataKey="termine" name="Terminé" fill="#22c55e" stackId="a" />
        <Bar dataKey="bloque" name="Bloqué" fill="#ef4444" stackId="a" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
