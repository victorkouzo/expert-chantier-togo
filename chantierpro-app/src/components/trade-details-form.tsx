"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";

export interface TradeDetail {
  trade: string;
  workers: number;
  description: string;
  progress: number;
}

const tradeOptions = [
  { value: "maconnerie", label: "Maçonnerie" },
  { value: "electricite", label: "Électricité" },
  { value: "plomberie", label: "Plomberie" },
  { value: "peinture", label: "Peinture" },
  { value: "charpente", label: "Charpente" },
  { value: "ferraillage", label: "Ferraillage" },
  { value: "coffrage", label: "Coffrage" },
  { value: "finition", label: "Finition" },
  { value: "terrassement", label: "Terrassement" },
  { value: "etancheite", label: "Étanchéité" },
  { value: "carrelage", label: "Carrelage" },
  { value: "menuiserie", label: "Menuiserie" },
  { value: "autre", label: "Autre" },
];

interface Props {
  onChange: (details: TradeDetail[]) => void;
}

export function TradeDetailsForm({ onChange }: Props) {
  const [details, setDetails] = useState<TradeDetail[]>([]);

  function addTrade() {
    const updated = [...details, { trade: "maconnerie", workers: 1, description: "", progress: 0 }];
    setDetails(updated);
    onChange(updated);
  }

  function updateTrade(index: number, field: keyof TradeDetail, value: string | number) {
    const updated = details.map((d, i) => i === index ? { ...d, [field]: value } : d);
    setDetails(updated);
    onChange(updated);
  }

  function removeTrade(index: number) {
    const updated = details.filter((_, i) => i !== index);
    setDetails(updated);
    onChange(updated);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-zinc-300">Détails par corps de métier</label>
        <Button type="button" variant="ghost" size="sm" onClick={addTrade}>
          <Plus size={14} className="mr-1" /> Ajouter
        </Button>
      </div>

      {details.map((d, i) => (
        <div key={i} className="space-y-2 rounded-lg border border-zinc-800 p-3">
          <div className="flex items-start gap-2">
            <div className="flex-1 grid grid-cols-2 gap-2">
              <Select
                label="Corps de métier"
                options={tradeOptions}
                value={d.trade}
                onChange={(e) => updateTrade(i, "trade", e.target.value)}
              />
              <Input
                label="Ouvriers"
                type="number"
                min={0}
                value={d.workers}
                onChange={(e) => updateTrade(i, "workers", parseInt(e.target.value) || 0)}
              />
            </div>
            <button type="button" onClick={() => removeTrade(i)} className="mt-6 p-1 text-red-400 hover:text-red-300">
              <Trash2 size={16} />
            </button>
          </div>
          <Textarea
            label="Description des travaux"
            rows={2}
            value={d.description}
            onChange={(e) => updateTrade(i, "description", e.target.value)}
            placeholder="Ex: Coulage fondation bloc A..."
          />
          <div>
            <label className="mb-1 block text-xs text-zinc-400">Avancement : {d.progress}%</label>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={d.progress}
              onChange={(e) => updateTrade(i, "progress", parseInt(e.target.value))}
              className="w-full accent-green-400"
            />
          </div>
        </div>
      ))}

      {details.length === 0 && (
        <p className="text-xs text-zinc-500">Cliquez &quot;Ajouter&quot; pour détailler les travaux par corps de métier</p>
      )}
    </div>
  );
}
