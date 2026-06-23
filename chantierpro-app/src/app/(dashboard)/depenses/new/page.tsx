"use client";

import { Suspense, useActionState, useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createExpense } from "../actions";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Upload, X, FileText } from "lucide-react";

const categoryOptions = [
  { value: "materiaux", label: "Matériaux" },
  { value: "main_oeuvre", label: "Main d'oeuvre" },
  { value: "transport", label: "Transport" },
  { value: "location_engin", label: "Location engin" },
  { value: "autre", label: "Autre" },
];

function NewDepenseForm() {
  const [state, formAction, pending] = useActionState(createExpense, null);
  const [chantiers, setChantiers] = useState<{ value: string; label: string }[]>([]);
  const [receiptUrl, setReceiptUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const receiptRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedChantier = searchParams.get("chantier") ?? "";

  useEffect(() => {
    createClient()
      .from("chantiers")
      .select("id, name")
      .then(({ data }) => {
        setChantiers((data ?? []).map((c) => ({ value: c.id, label: c.name })));
      });
  }, []);

  useEffect(() => {
    if (state && "success" in state && state.success) router.push("/depenses");
  }, [state, router]);

  useEffect(() => {
    if (receiptRef.current) receiptRef.current.value = receiptUrl;
  }, [receiptUrl]);

  async function handleReceiptUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `receipts/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("chantier-documents").upload(path, file);
    if (!error) {
      const { data } = supabase.storage.from("chantier-documents").getPublicUrl(path);
      setReceiptUrl(data.publicUrl);
    }
    setUploading(false);
  }

  return (
    <Card>
      <form action={formAction} className="space-y-4">
        <Select label="Chantier" name="chantier_id" options={chantiers} required defaultValue={preselectedChantier} />
        <Select label="Catégorie" name="category" options={categoryOptions} required />
        <Textarea label="Description" name="description" rows={2} required />
        <Input label="Montant (FCFA)" name="amount" type="number" required min={1} />
        <Input label="Date" name="expense_date" type="date" required defaultValue={new Date().toISOString().split("T")[0]} />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-zinc-300">Facture / Reçu (optionnel)</label>
          {receiptUrl ? (
            <div className="flex items-center gap-2 rounded-lg border border-zinc-700 p-2">
              <FileText size={16} className="text-green-400" />
              <span className="flex-1 truncate text-sm text-zinc-400">Fichier uploadé</span>
              <button type="button" onClick={() => setReceiptUrl("")} className="text-red-400 hover:text-red-300">
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-700 py-3 text-sm text-zinc-500 transition-colors hover:border-green-400 hover:text-green-400"
            >
              {uploading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-500 border-t-green-400" />
              ) : (
                <>
                  <Upload size={16} />
                  Joindre une facture ou un reçu
                </>
              )}
            </button>
          )}
          <input ref={fileInputRef} type="file" accept="image/*,.pdf" onChange={handleReceiptUpload} className="hidden" />
        </div>

        <input ref={receiptRef} type="hidden" name="receipt_url" value="" />

        {state && "error" in state && typeof state.error === "string" && (
          <p className="text-sm text-red-400">{state.error}</p>
        )}

        <Button type="submit" loading={pending} className="w-full">
          Enregistrer la dépense
        </Button>
      </form>
    </Card>
  );
}

export default function NewDepensePage() {
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-2xl font-bold text-white">Nouvelle dépense</h1>
      <Suspense fallback={<Card className="animate-pulse h-64" />}>
        <NewDepenseForm />
      </Suspense>
    </div>
  );
}
