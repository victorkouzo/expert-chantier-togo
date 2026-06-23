"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createChantier } from "../actions";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { MapPin, Crosshair } from "lucide-react";

export default function NewChantierPage() {
  const [state, formAction, pending] = useActionState(createChantier, null);
  const [clients, setClients] = useState<{ value: string; label: string }[]>([]);
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [gpsLoading, setGpsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    createClient().from("clients").select("id, name").then(({ data }) => {
      setClients([
        { value: "", label: "— Aucun client —" },
        ...(data ?? []).map(c => ({ value: c.id, label: c.name }))
      ]);
    });
  }, []);

  useEffect(() => {
    if (state && "success" in state && state.success) router.push("/chantiers");
  }, [state, router]);

  function getCurrentPosition() {
    if (!navigator.geolocation) return;
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(6));
        setLng(pos.coords.longitude.toFixed(6));
        setGpsLoading(false);
      },
      () => setGpsLoading(false),
      { enableHighAccuracy: true }
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-2xl font-bold text-white">Nouveau chantier</h1>

      <Card>
        <form action={formAction} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <Input label="Nom du chantier" name="name" required className="col-span-2" />
            <Input label="Référence" name="reference" placeholder="Ex: CH-2024-01" />
          </div>

          <Select label="Client / Maître d'ouvrage (optionnel)" name="client_id" options={clients} />

          <Textarea label="Description" name="description" rows={3} />

          <div className="grid grid-cols-2 gap-4">
            <Input label="Adresse" name="address" required />
            <Input label="Ville" name="city" required defaultValue="Lomé" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-zinc-300">Coordonnées GPS (optionnel)</label>
              <button
                type="button"
                onClick={getCurrentPosition}
                disabled={gpsLoading}
                className="flex items-center gap-1 text-xs text-green-400 hover:text-green-300"
              >
                <Crosshair size={12} />
                {gpsLoading ? "Localisation..." : "Position actuelle"}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input name="latitude" type="number" step="any" placeholder="Latitude" value={lat} onChange={(e) => setLat(e.target.value)} />
              <Input name="longitude" type="number" step="any" placeholder="Longitude" value={lng} onChange={(e) => setLng(e.target.value)} />
            </div>
            {lat && lng && (
              <a
                href={`https://www.google.com/maps?q=${lat},${lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-green-400"
              >
                <MapPin size={11} /> Voir sur Google Maps
              </a>
            )}
          </div>

          <Input label="Budget (FCFA)" name="budget" type="number" required min={0} />

          <div className="grid grid-cols-2 gap-4">
            <Input label="Date de début" name="start_date" type="date" required />
            <Input label="Date de fin (optionnel)" name="end_date" type="date" />
          </div>

          {state && "error" in state && typeof state.error === "string" && (
            <p className="text-sm text-red-400">{state.error}</p>
          )}

          <Button type="submit" loading={pending} className="w-full">
            Créer le chantier
          </Button>
        </form>
      </Card>
    </div>
  );
}
