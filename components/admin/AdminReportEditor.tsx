"use client";

import { useState } from "react";
import { MediaUploader } from "@/app/(admin)/admin/media/MediaUploader";
import { PageForm } from "@/app/(admin)/admin/pages/PageForm";

export function AdminReportEditor({ initial }: { initial?: any }) {
  const [appendHtml, setAppendHtml] = useState<string | null>(null);

  const handleUploaded = (row: { id: string; url: string }) => {
    if (!row?.url) return;
    const snippet = `\n<div class="report-pdf">\n  <object data="${row.url}" type="application/pdf" width="100%" height="600">\n    <a href="${row.url}" target="_blank" rel="noopener noreferrer">Download PDF</a>\n  </object>\n</div>\n`;
    setAppendHtml(snippet);
    // Clear after a tick so repeated uploads produce new changes
    setTimeout(() => setAppendHtml(null), 100);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-card)] p-5">
        <h2 className="text-sm font-semibold">Upload report PDF</h2>
        <p className="text-xs text-[var(--color-muted-fg)]">Upload PDFs here to add them to the media library and insert into the page body.</p>
        <div className="mt-4">
          <MediaUploader onUploaded={handleUploaded} />
        </div>
      </section>

      <PageForm initial={initial} appendHtml={appendHtml} />
    </div>
  );
}
