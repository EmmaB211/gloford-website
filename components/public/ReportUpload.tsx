"use client";

import { useState, useRef } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function ReportUpload() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePick = () => inputRef.current?.click();

  const upload = async (file: File) => {
    setError(null);
    setStatus("Uploading…");
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/reports/upload", { method: "POST", body: form });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? `Upload failed: ${res.status}`);
      // returned shape is { id, url }
      const url = (body as any).url ?? (body as any).id ? (body as any).url ?? null : null;
      setStatus("Upload complete — thank you");
      if (url) setPreviewUrl(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setStatus(null);
    }
  };

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-card)] p-6">
      <h3 className="text-lg font-semibold">Submit a report</h3>
      <p className="mt-2 text-sm text-[var(--color-muted-fg)]">Upload a PDF report for our team to review (max 10 MB).</p>

      <div className="mt-4 flex items-center gap-3">
        <Button variant="outline" onClick={handlePick}>
          <Upload className="h-4 w-4" /> Choose PDF
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void upload(f);
            e.currentTarget.value = "";
          }}
        />
        {status ? <div className="text-sm text-[var(--color-fg)]">{status}</div> : null}
        {error ? <div className="text-sm text-[var(--color-danger)]">{error}</div> : null}
      </div>
      {previewUrl ? (
        <div className="mt-4">
          <div className="mb-2 text-sm font-medium">Preview</div>
          <div className="border rounded bg-white">
            <object data={previewUrl} type="application/pdf" className="h-96 w-full">
              <div className="p-4 text-sm text-[var(--color-muted-fg)]">
                Could not preview PDF — <a href={previewUrl} target="_blank" rel="noreferrer">open in new tab</a>.
              </div>
            </object>
          </div>
        </div>
      ) : null}
    </div>
  );
}
