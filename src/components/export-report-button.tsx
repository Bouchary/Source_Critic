"use client";

import { Printer } from "lucide-react";

interface ExportReportButtonProps {
  targetId: string;
  fileTitle?: string;
}

export function ExportReportButton({
  targetId,
  fileTitle = "rapport",
}: ExportReportButtonProps) {
  function handlePrint() {
    const target = document.getElementById(targetId);

    if (!target) {
      window.alert("Impossible de trouver le contenu à exporter.");
      return;
    }

    const printWindow = window.open("", "_blank", "width=1200,height=900");

    if (!printWindow) {
      window.alert(
        "La fenêtre d’export a été bloquée. Autorisez les pop-ups pour ce site.",
      );
      return;
    }

    const html = `
      <!doctype html>
      <html lang="fr">
        <head>
          <meta charset="utf-8" />
          <title>${fileTitle}</title>
          <style>
            * {
              box-sizing: border-box;
            }

            html, body {
              margin: 0;
              padding: 0;
              background: #ffffff;
              color: #111827;
              font-family: Inter, Arial, Helvetica, sans-serif;
              line-height: 1.5;
            }

            body {
              padding: 24px;
            }

            .print-root {
              max-width: 960px;
              margin: 0 auto;
            }

            h1, h2, h3 {
              margin: 0 0 10px 0;
              color: #111827;
              page-break-after: avoid;
            }

            p, li, blockquote, span, a {
              color: #1f2937;
              word-break: break-word;
              overflow-wrap: anywhere;
            }

            a {
              color: #1d4ed8;
              text-decoration: underline;
            }

            ul {
              margin: 8px 0 0 0;
              padding-left: 18px;
            }

            blockquote {
              margin: 12px 0;
              padding-left: 14px;
              border-left: 3px solid #d1d5db;
              font-style: italic;
            }

            [data-no-print] {
              display: none !important;
            }

            .rounded-2xl,
            .rounded-3xl,
            .rounded-full,
            .rounded-xl {
              border-radius: 0 !important;
            }

            .shadow-xl,
            .shadow-2xl,
            .backdrop-blur {
              box-shadow: none !important;
              backdrop-filter: none !important;
            }

            .border,
            [class*="border-"] {
              border: 1px solid #d1d5db !important;
            }

            [class*="bg-"] {
              background: transparent !important;
            }

            .grid {
              display: block !important;
            }

            .flex {
              display: block !important;
            }

            .gap-2,
            .gap-3,
            .gap-4,
            .gap-5,
            .gap-6,
            .gap-8 {
              gap: 0 !important;
            }

            .space-y-2 > *,
            .space-y-4 > * {
              margin-top: 8px !important;
            }

            .space-y-2 > *:first-child,
            .space-y-4 > *:first-child {
              margin-top: 0 !important;
            }

            .mb-2,
            .mb-3,
            .mb-4,
            .mb-5 {
              margin-bottom: 10px !important;
            }

            .mt-2,
            .mt-3,
            .mt-4,
            .mt-6 {
              margin-top: 10px !important;
            }

            .p-4,
            .p-5,
            .p-6,
            .p-8,
            .px-3,
            .px-4,
            .py-2,
            .py-3,
            .py-4 {
              padding: 12px !important;
            }

            .inline-flex {
              display: inline-block !important;
            }

            @page {
              size: A4;
              margin: 14mm;
            }
          </style>
        </head>
        <body>
          <div class="print-root">
            ${target.innerHTML}
          </div>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();

    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
  }

  return (
    <button
      type="button"
      onClick={handlePrint}
      data-no-print
      className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
    >
      <Printer className="h-4 w-4" />
      Exporter en PDF
    </button>
  );
}