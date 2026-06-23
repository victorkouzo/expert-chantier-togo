import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, FileText, File, Image, FileSpreadsheet, Download, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { DeleteDocButton } from "./delete-doc-button";

const categoryLabels: Record<string, { label: string; color: string }> = {
  contrat: { label: "Contrat", color: "bg-blue-500/20 text-blue-400" },
  plan: { label: "Plan", color: "bg-purple-500/20 text-purple-400" },
  permis: { label: "Permis", color: "bg-green-500/20 text-green-400" },
  facture: { label: "Facture", color: "bg-yellow-500/20 text-yellow-400" },
  pv_reception: { label: "PV Réception", color: "bg-cyan-500/20 text-cyan-400" },
  rapport_inspection: { label: "Rapport d'inspection", color: "bg-orange-500/20 text-orange-400" },
  photo: { label: "Photo", color: "bg-pink-500/20 text-pink-400" },
  autre: { label: "Autre", color: "bg-zinc-500/20 text-zinc-400" },
};

function getFileIcon(fileType: string | null) {
  if (!fileType) return File;
  if (fileType.startsWith("image/")) return Image;
  if (fileType.includes("spreadsheet") || fileType.includes("excel")) return FileSpreadsheet;
  return FileText;
}

function formatFileSize(bytes: number) {
  if (bytes === 0) return "—";
  if (bytes < 1024) return bytes + " o";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " Ko";
  return (bytes / (1024 * 1024)).toFixed(1) + " Mo";
}

export default async function DocumentsPage() {
  const supabase = await createClient();
  const { data: documents } = await supabase
    .from("documents")
    .select("*, chantiers(name)")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Documents</h1>
        <Link href="/documents/new">
          <Button><Plus size={16} className="mr-2" />Ajouter un document</Button>
        </Link>
      </div>

      {(!documents || documents.length === 0) ? (
        <Card className="flex flex-col items-center gap-3 py-16 text-zinc-500">
          <FileText size={32} />
          <p>Aucun document. Ajoutez contrats, plans, permis, factures...</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => {
            const cat = categoryLabels[doc.category] ?? categoryLabels.autre;
            const Icon = getFileIcon(doc.file_type);
            const chantierName = doc.chantiers && typeof doc.chantiers === "object"
              ? (doc.chantiers as { name: string }).name : "—";

            return (
              <Card key={doc.id} className="flex items-center gap-4">
                <Icon size={24} className="text-zinc-400 shrink-0" />
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-white truncate">{doc.name}</p>
                    <span className={`rounded-full px-2 py-0.5 text-xs shrink-0 ${cat.color}`}>{cat.label}</span>
                  </div>
                  <p className="text-xs text-zinc-500">
                    {chantierName} · {formatFileSize(doc.file_size || 0)} · {format(new Date(doc.created_at), "d MMM yyyy", { locale: fr })}
                  </p>
                  {doc.description && <p className="text-xs text-zinc-600 truncate">{doc.description}</p>}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="sm"><Download size={14} /></Button>
                  </a>
                  <DeleteDocButton documentId={doc.id} />
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
