"use client";

import { useActionState, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createDocument } from "../actions";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Upload } from "lucide-react";

const categoryOptions = [
  { value: "contrat", label: "Contrat" },
  { value: "plan", label: "Plan" },
  { value: "permis", label: "Permis" },
  { value: "facture", label: "Facture" },
  { value: "pv_reception", label: "PV Réception" },
  { value: "rapport_inspection", label: "Rapport d'inspection" },
  { value: "photo", label: "Photo" },
  { value: "autre", label: "Autre" },
];

export default function NewDocumentPage() {
  const [state, formAction, pending] = useActionState(createDocument, null);
  const [chantiers, setChantiers] = useState<{ value: string; label: string }[]>([]);
  const [fileUrl, setFileUrl] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [fileType, setFileType] = useState("");
  const [fileName, setFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    createClient()
      .from("chantiers")
      .select("id, name")
      .then(({ data }) => {
        setChantiers((data ?? []).map((c) => ({ value: c.id, label: c.name })));
      });
  }, []);

  useEffect(() => {
    if (state && "success" in state && state.success) router.push("/documents");
  }, [state, router]);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const supabase = createClient();
    const path = `documents/${Date.now()}-${Math.random().toString(36).slice(2)}-${file.name}`;

    const { error } = await supabase.storage.from("chantier-documents").upload(path, file);
    if (!error) {
      const { data } = supabase.storage.from("chantier-documents").getPublicUrl(path);
      setFileUrl(data.publicUrl);
      setFileSize(file.size);
      setFileType(file.type);
      if (!fileName) setFileName(file.name);
    }
    setUploading(false);
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-2xl font-bold text-white">Ajouter un document</h1>
      <Card>
        <form action={formAction} className="space-y-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-zinc-700 p-8 text-zinc-500 transition-colors hover:border-green-400 hover:text-green-400"
          >
            {uploading ? (
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-500 border-t-green-400" />
            ) : fileUrl ? (
              <>
                <Upload size={24} className="text-green-400" />
                <p className="text-sm text-green-400">Fichier uploadé</p>
                <p className="text-xs text-zinc-500">{fileType} · {(fileSize / 1024).toFixed(1)} Ko</p>
              </>
            ) : (
              <>
                <Upload size={24} />
                <p className="text-sm">Cliquez pour sélectionner un fichier</p>
                <p className="text-xs">PDF, images, documents Office...</p>
              </>
            )}
          </div>
          <input ref={fileInputRef} type="file" onChange={handleFileUpload} className="hidden" />

          <input type="hidden" name="file_url" value={fileUrl} />
          <input type="hidden" name="file_size" value={fileSize} />
          <input type="hidden" name="file_type" value={fileType} />

          <Input label="Nom du document" name="name" required value={fileName} onChange={(e) => setFileName(e.target.value)} />
          <Textarea label="Description (optionnel)" name="description" rows={2} />
          <Select label="Chantier" name="chantier_id" options={chantiers} required />
          <Select label="Catégorie" name="category" options={categoryOptions} />

          {state && "error" in state && typeof state.error === "string" && (
            <p className="text-sm text-red-400">{state.error}</p>
          )}

          <Button type="submit" loading={pending} disabled={!fileUrl} className="w-full">
            Enregistrer le document
          </Button>
        </form>
      </Card>
    </div>
  );
}
