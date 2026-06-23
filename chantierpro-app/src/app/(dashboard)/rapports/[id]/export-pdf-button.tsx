"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface RapportData {
  id: string;
  report_date: string;
  weather: string;
  temperature: number | null;
  summary: string;
  workers_present: number;
  tasks_completed: string;
  issues: string | null;
  chantier_name: string;
  author_name: string;
}

export function ExportPdfButton({ rapport }: { rapport: RapportData }) {
  async function handleExport() {
    const { default: jsPDF } = await import("jspdf");
    const doc = new jsPDF();

    const margin = 20;
    let y = margin;

    doc.setFontSize(18);
    doc.setTextColor(40, 40, 40);
    doc.text("ChantierPro — Rapport Journalier", margin, y);
    y += 12;

    doc.setDrawColor(180, 240, 64);
    doc.setLineWidth(0.5);
    doc.line(margin, y, 190, y);
    y += 10;

    doc.setFontSize(11);
    doc.setTextColor(80, 80, 80);

    const info = [
      ["Chantier", rapport.chantier_name],
      ["Date", new Date(rapport.report_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })],
      ["Météo", rapport.weather + (rapport.temperature ? ` · ${rapport.temperature}°C` : "")],
      ["Ouvriers présents", String(rapport.workers_present)],
      ["Auteur", rapport.author_name],
    ];

    for (const [label, value] of info) {
      doc.setFont("helvetica", "bold");
      doc.text(`${label} :`, margin, y);
      doc.setFont("helvetica", "normal");
      doc.text(value, margin + 45, y);
      y += 7;
    }

    y += 5;

    const sections = [
      { title: "Résumé des travaux", content: rapport.summary },
      { title: "Tâches accomplies", content: rapport.tasks_completed },
      ...(rapport.issues ? [{ title: "Problèmes rencontrés", content: rapport.issues }] : []),
    ];

    for (const section of sections) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(40, 40, 40);
      doc.text(section.title, margin, y);
      y += 7;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      const lines = doc.splitTextToSize(section.content, 170);
      for (const line of lines) {
        if (y > 270) {
          doc.addPage();
          y = margin;
        }
        doc.text(line, margin, y);
        y += 5;
      }
      y += 8;
    }

    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Généré par ChantierPro — ${new Date().toLocaleDateString("fr-FR")}`, margin, 285);

    doc.save(`rapport-${rapport.report_date}-${rapport.id.slice(0, 8)}.pdf`);
  }

  return (
    <Button variant="secondary" onClick={handleExport}>
      <Download size={16} className="mr-2" />
      Exporter PDF
    </Button>
  );
}
