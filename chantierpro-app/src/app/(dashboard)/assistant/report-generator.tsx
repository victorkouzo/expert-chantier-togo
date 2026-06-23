"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Copy, Check } from "lucide-react";

export function ReportGenerator() {
  const [period, setPeriod] = useState<"hebdomadaire" | "mensuel">("hebdomadaire");
  const [report, setReport] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function generate() {
    setLoading(true);
    setError("");
    setReport("");
    try {
      const res = await fetch("/api/ai/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ period }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? "Erreur");
      else setReport(data.report);
    } catch {
      setError("Erreur de connexion");
    }
    setLoading(false);
  }

  function copy() {
    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Card className="space-y-4">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
        <FileText size={18} className="text-green-400" /> Générer un rapport de synthèse
      </h2>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setPeriod("hebdomadaire")}
          className={`flex-1 rounded-lg border py-2 text-sm transition-colors ${
            period === "hebdomadaire" ? "border-green-500 text-white" : "border-zinc-700 text-zinc-400"
          }`}
        >
          Hebdomadaire
        </button>
        <button
          type="button"
          onClick={() => setPeriod("mensuel")}
          className={`flex-1 rounded-lg border py-2 text-sm transition-colors ${
            period === "mensuel" ? "border-green-500 text-white" : "border-zinc-700 text-zinc-400"
          }`}
        >
          Mensuel
        </button>
      </div>

      <Button onClick={generate} loading={loading} className="w-full">
        Générer le rapport {period}
      </Button>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {report && (
        <div className="space-y-2">
          <div className="flex justify-end">
            <Button variant="ghost" size="sm" onClick={copy}>
              {copied ? <><Check size={14} className="mr-1" /> Copié</> : <><Copy size={14} className="mr-1" /> Copier</>}
            </Button>
          </div>
          <div className="max-h-[28rem] overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-900 p-4">
            <pre className="whitespace-pre-wrap font-sans text-sm text-zinc-300">{report}</pre>
          </div>
        </div>
      )}
    </Card>
  );
}
