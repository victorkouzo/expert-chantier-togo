"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import type jsPDF from "jspdf";

interface TradeDetail {
  label: string;
  workers: number;
  description: string;
  progress: number;
}

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
  chantier_city: string;
  company_name: string;
  author_name: string;
  photos: string[];
  trades: TradeDetail[];
  signature: string | null;
}

// Palette calquée sur le rapport de référence (bandeaux et tableaux bleu foncé)
const DARK_BLUE: [number, number, number] = [31, 78, 121];
const MID_BLUE: [number, number, number] = [46, 116, 181];
const LIGHT_BLUE: [number, number, number] = [222, 235, 247];
const TEXT_DARK: [number, number, number] = [40, 40, 40];
const TEXT_GRAY: [number, number, number] = [95, 95, 95];

const PAGE_W = 210;
const MARGIN = 18;
const CONTENT_W = PAGE_W - MARGIN * 2;
const HEADER_BOTTOM = 30;
const FOOTER_TOP = 278;

interface LoadedImage {
  dataUrl: string;
  width: number;
  height: number;
}

async function loadImage(url: string): Promise<LoadedImage | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    const dims = await new Promise<{ width: number; height: number }>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = reject;
      img.src = dataUrl;
    });
    return { dataUrl, ...dims };
  } catch {
    return null;
  }
}

export function ExportPdfButton({ rapport }: { rapport: RapportData }) {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    try {
      const { default: JsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");
      const doc = new JsPDF();

      const dateLabel = new Date(rapport.report_date).toLocaleDateString("fr-FR", {
        day: "numeric", month: "long", year: "numeric",
      });
      const shortDate = new Date(rapport.report_date).toLocaleDateString("fr-FR");

      const photos = (await Promise.all(rapport.photos.map(loadImage)))
        .filter((p): p is LoadedImage => p !== null);

      // ————— Page de garde —————
      let y = 30;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(15);
      doc.setTextColor(...DARK_BLUE);
      doc.text(rapport.company_name.toUpperCase(), PAGE_W / 2, y, { align: "center" });
      y += 8;

      doc.setDrawColor(...TEXT_DARK);
      doc.setLineWidth(0.8);
      doc.line(MARGIN, y, PAGE_W - MARGIN, y);
      y += 10;

      doc.setFontSize(12);
      doc.setTextColor(...MID_BLUE);
      doc.text("SUIVI ET GESTION DE CHANTIER", PAGE_W / 2, y, { align: "center" });
      y += 12;

      // Photo de couverture = première photo du rapport
      if (photos.length > 0) {
        const cover = photos[0];
        const w = CONTENT_W;
        const h = Math.min(95, (cover.height / cover.width) * w);
        doc.setDrawColor(...TEXT_DARK);
        doc.setLineWidth(0.5);
        doc.rect(MARGIN - 0.5, y - 0.5, w + 1, h + 1);
        doc.addImage(cover.dataUrl, MARGIN, y, w, h);
        y += h + 14;
      } else {
        y += 30;
      }

      // Bandeau bleu foncé : titre du rapport
      doc.setFillColor(...DARK_BLUE);
      doc.rect(MARGIN, y, CONTENT_W, 24, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(17);
      doc.text(`RAPPORT DE CHANTIER DU ${shortDate}`, PAGE_W / 2, y + 10, { align: "center" });
      doc.setFontSize(12);
      doc.text(`SITE : ${rapport.chantier_name.toUpperCase()}`, PAGE_W / 2, y + 19, { align: "center" });
      y += 24;

      // Bandeau clair : infos complémentaires
      doc.setFillColor(...LIGHT_BLUE);
      doc.rect(MARGIN, y + 2, CONTENT_W, 18, "F");
      doc.setTextColor(...DARK_BLUE);
      doc.setFontSize(10.5);
      doc.text(
        `${rapport.chantier_city ? `${rapport.chantier_city} — ` : ""}Météo : ${rapport.weather}${rapport.temperature ? ` · ${rapport.temperature}°C` : ""}`,
        PAGE_W / 2, y + 9, { align: "center" }
      );
      doc.setFont("helvetica", "normal");
      doc.text(`Rédigé par : ${rapport.author_name}`, PAGE_W / 2, y + 16, { align: "center" });

      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.setTextColor(...TEXT_GRAY);
      doc.text(`Date d'émission : ${new Date().toLocaleDateString("fr-FR")}`, PAGE_W - MARGIN, 280, { align: "right" });

      // ————— Corps du rapport —————
      doc.addPage();
      y = HEADER_BOTTOM + 8;
      let sectionNo = 0;

      const ensureSpace = (needed: number) => {
        if (y + needed > FOOTER_TOP - 4) {
          doc.addPage();
          y = HEADER_BOTTOM + 8;
        }
      };

      const sectionTitle = (title: string) => {
        sectionNo += 1;
        ensureSpace(20);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.setTextColor(...DARK_BLUE);
        doc.text(`${sectionNo}. ${title}`, MARGIN, y);
        doc.setDrawColor(...DARK_BLUE);
        doc.setLineWidth(0.7);
        doc.line(MARGIN, y + 2, PAGE_W - MARGIN, y + 2);
        y += 10;
        return sectionNo;
      };

      const subTitle = (no: string, title: string) => {
        ensureSpace(14);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(...MID_BLUE);
        doc.text(`${no} ${title}`, MARGIN, y);
        y += 7;
      };

      const paragraph = (text: string) => {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(...TEXT_DARK);
        for (const line of doc.splitTextToSize(text, CONTENT_W)) {
          ensureSpace(6);
          doc.text(line, MARGIN, y);
          y += 5.2;
        }
        y += 3;
      };

      // 1. RAPPORT DES ACTIVITÉS
      const s1 = sectionTitle("RAPPORT DES ACTIVITÉS");
      paragraph(rapport.summary);

      let sub = 0;
      for (const t of rapport.trades) {
        sub += 1;
        subTitle(`${s1}.${sub}`, t.label);
        if (t.description) paragraph(t.description);
        doc.setFont("helvetica", "italic");
        doc.setFontSize(9.5);
        doc.setTextColor(...TEXT_GRAY);
        ensureSpace(8);
        doc.text(`Ouvriers : ${t.workers} — Avancement : ${t.progress}%`, MARGIN, y);
        y += 9;
      }
      sub += 1;
      subTitle(`${s1}.${sub}`, "Tâches accomplies");
      paragraph(rapport.tasks_completed);

      // 2. PHOTOS DES TRAVAUX
      if (photos.length > 0) {
        sectionTitle("PHOTOS DES TRAVAUX");
        photos.forEach((photo, i) => {
          const maxW = 130;
          const w = Math.min(maxW, CONTENT_W);
          const h = Math.min(90, (photo.height / photo.width) * w);
          ensureSpace(h + 14);
          const x = (PAGE_W - w) / 2;
          doc.setDrawColor(...TEXT_GRAY);
          doc.setLineWidth(0.3);
          doc.rect(x - 0.5, y - 0.5, w + 1, h + 1);
          doc.addImage(photo.dataUrl, x, y, w, h);
          y += h + 5;
          doc.setFont("helvetica", "italic");
          doc.setFontSize(9);
          doc.setTextColor(...TEXT_GRAY);
          doc.text(`Photo ${i + 1} — ${rapport.chantier_name}`, PAGE_W / 2, y, { align: "center" });
          y += 9;
        });
      }

      // 3. MOYENS MIS EN ŒUVRE
      sectionTitle("MOYENS MIS EN ŒUVRE");
      const humanRows: (string | number)[][] = rapport.trades.map((t) => [t.label, String(t.workers).padStart(2, "0")]);
      humanRows.push(["Total ouvriers présents", String(rapport.workers_present).padStart(2, "0")]);
      ensureSpace(20);
      autoTable(doc, {
        startY: y,
        margin: { left: MARGIN, right: MARGIN, top: HEADER_BOTTOM + 4, bottom: 297 - FOOTER_TOP + 4 },
        head: [["Désignation", "Quantité"]],
        body: humanRows,
        theme: "grid",
        headStyles: { fillColor: DARK_BLUE, textColor: 255, fontStyle: "bold", halign: "center", fontSize: 10 },
        bodyStyles: { fontSize: 10, textColor: TEXT_DARK },
        alternateRowStyles: { fillColor: [242, 242, 242] },
        columnStyles: {
          0: { cellWidth: CONTENT_W * 0.65 },
          1: { cellWidth: CONTENT_W * 0.35, halign: "center", fontStyle: "bold", textColor: MID_BLUE },
        },
      });
      y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 12;

      // 4. AVANCEMENT DES TRAVAUX
      if (rapport.trades.length > 0) {
        sectionTitle("AVANCEMENT DES TRAVAUX");
        ensureSpace(20);
        autoTable(doc, {
          startY: y,
          margin: { left: MARGIN, right: MARGIN, top: HEADER_BOTTOM + 4, bottom: 297 - FOOTER_TOP + 4 },
          head: [["N°", "ACTIVITÉS", "OUVRIERS", "AVANCEMENT"]],
          body: rapport.trades.map((t, i) => [
            String(i + 1),
            t.description ? `${t.label} — ${t.description}` : t.label,
            String(t.workers).padStart(2, "0"),
            `${t.progress}%`,
          ]),
          theme: "grid",
          headStyles: { fillColor: DARK_BLUE, textColor: 255, fontStyle: "bold", halign: "center", fontSize: 9.5 },
          bodyStyles: { fontSize: 9.5, textColor: TEXT_DARK },
          alternateRowStyles: { fillColor: [242, 242, 242] },
          columnStyles: {
            0: { cellWidth: 12, halign: "center" },
            2: { cellWidth: 26, halign: "center" },
            3: { cellWidth: 32, halign: "center", fontStyle: "bold", textColor: MID_BLUE },
          },
        });
        y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 12;
      }

      // 5. PROBLÈMES RENCONTRÉS
      if (rapport.issues) {
        sectionTitle("PROBLÈMES RENCONTRÉS");
        paragraph(rapport.issues);
      }

      // Signature
      if (rapport.signature) {
        ensureSpace(40);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(...TEXT_DARK);
        doc.text(`Signature — ${rapport.author_name}`, PAGE_W - MARGIN - 60, y);
        try {
          doc.addImage(rapport.signature, PAGE_W - MARGIN - 60, y + 3, 50, 22);
        } catch {
          // signature illisible : on n'affiche que le nom
        }
        y += 32;
      }

      // ————— En-têtes et pieds de page (pages 2+) —————
      const pageCount = doc.getNumberOfPages();
      for (let p = 2; p <= pageCount; p++) {
        doc.setPage(p);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(...DARK_BLUE);
        doc.text(`RAPPORT DE CHANTIER — ${rapport.chantier_name.toUpperCase()}`, PAGE_W / 2, 14, { align: "center" });
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(...TEXT_GRAY);
        doc.text(
          `${rapport.chantier_city ? `Site : ${rapport.chantier_city} | ` : ""}Date : ${dateLabel}`,
          PAGE_W / 2, 19, { align: "center" }
        );
        doc.setDrawColor(...TEXT_DARK);
        doc.setLineWidth(0.6);
        doc.line(MARGIN, 23, PAGE_W - MARGIN, 23);

        doc.line(MARGIN, FOOTER_TOP, PAGE_W - MARGIN, FOOTER_TOP);
        doc.setFontSize(7.5);
        doc.text(`${rapport.company_name} — ${rapport.chantier_name}`, MARGIN, FOOTER_TOP + 5);
        doc.setTextColor(...MID_BLUE);
        doc.text(`Page ${p}`, PAGE_W - MARGIN, FOOTER_TOP + 5, { align: "right" });
      }

      doc.save(`rapport-${rapport.report_date}-${rapport.id.slice(0, 8)}.pdf`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="secondary" onClick={handleExport} loading={loading}>
      <Download size={16} className="mr-2" />
      Exporter PDF
    </Button>
  );
}
