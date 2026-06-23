"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface StatusChartProps {
  data: { name: string; value: number; color: string }[];
}

export function StatusChart({ data }: StatusChartProps) {
  if (data.every((d) => d.value === 0)) {
    return <p className="py-8 text-center text-sm text-zinc-600">Aucun chantier</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={data.filter((d) => d.value > 0)}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={80}
          paddingAngle={4}
          dataKey="value"
        >
          {data.filter((d) => d.value > 0).map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: "8px" }}
          labelStyle={{ color: "#fff" }}
        />
        <Legend
          formatter={(value) => <span style={{ color: "#888", fontSize: 12 }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
