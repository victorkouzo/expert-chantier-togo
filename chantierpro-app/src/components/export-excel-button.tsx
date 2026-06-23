"use client";

import { Button } from "@/components/ui/button";
import { FileSpreadsheet } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function ExportExcelButton() {
  async function handleExport() {
    const supabase = createClient();
    const { data: depenses } = await supabase
      .from("expenses")
      .select("*, chantiers(name)")
      .order("expense_date", { ascending: false });

    if (!depenses || depenses.length === 0) {
      alert("Aucune dépense à exporter");
      return;
    }

    const XLSX = await import("xlsx");

    const rows = depenses.map((d) => ({
      "Date": d.expense_date,
      "Chantier": d.chantiers && typeof d.chantiers === "object" ? (d.chantiers as { name: string }).name : "—",
      "Catégorie": d.category,
      "Description": d.description,
      "Montant (FCFA)": d.amount,
    }));

    const total = depenses.reduce((s, d) => s + (d.amount || 0), 0);
    rows.push({
      "Date": "",
      "Chantier": "",
      "Catégorie": "",
      "Description": "TOTAL",
      "Montant (FCFA)": total,
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Dépenses");

    ws["!cols"] = [
      { wch: 12 },
      { wch: 25 },
      { wch: 15 },
      { wch: 35 },
      { wch: 15 },
    ];

    XLSX.writeFile(wb, `depenses-chantierpro-${new Date().toISOString().split("T")[0]}.xlsx`);
  }

  return (
    <Button variant="secondary" onClick={handleExport}>
      <FileSpreadsheet size={16} className="mr-2" />
      Export Excel
    </Button>
  );
}
