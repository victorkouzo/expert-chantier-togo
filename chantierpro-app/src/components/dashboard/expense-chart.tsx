"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ExpenseChartProps {
  data: { name: string; montant: number }[];
}

export function ExpenseChart({ data }: ExpenseChartProps) {
  if (data.length === 0) {
    return <p className="py-8 text-center text-sm text-zinc-600">Aucune donnée</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
        <XAxis dataKey="name" tick={{ fill: "#888", fontSize: 12 }} />
        <YAxis tick={{ fill: "#888", fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
        <Tooltip
          contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: "8px" }}
          labelStyle={{ color: "#fff" }}
          formatter={(value) => [`${Number(value).toLocaleString("fr-FR")} FCFA`, "Montant"]}
        />
        <Bar dataKey="montant" fill="#b8f040" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
