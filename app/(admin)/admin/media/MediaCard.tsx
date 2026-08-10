"use client";

import { useTransition } from "react";
import { Trash2, Copy, Check, ImageIcon, FileText, ExternalLink } from "lucide-react";
import { useState } from "react";
import { deleteMediaAction, toggleGalleryAction } from "@/lib/actions/media";
import { cn } from "@/lib/utils/cn";
import { useConfirmAction } from "@/components/ui/useConfirmAction";

type Item = {
  id: string;
  url: string;
  mime: string;
  alt: string | null;
  width: number | null;
  height: number | null;
  showInGallery: boolean;
};

export function MediaCard({ item }: { item: Item }) {
  const [pending, start] = useTransition();
  const [copied, setCopied] = useState(false);
  const confirmAction = useConfirmAction();

  const copy = async () => {
    await navigator.clipboard.writeText(item.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const del = async () => {
    const ok = await confirmAction({
      title: "Delete media",
      description: "Delete this media file?",
      confirmLabel: "Delete",
      variant: "danger",
    });
    if (!ok) return;
    start(() => deleteMediaAction({ id: item.id }));
  };

  const toggleGallery = () => {
    start(() => toggleGalleryAction(item.id, !item.showInGallery));
  };

  const [showPreview, setShowPreview] = useState(false);

  return (
    <figure className={cn(
      "group relative overflow-hidden rounded-[var(--radius-md)] border bg-[var(--color-card)] transition-shadow hover:shadow-md",
      item.showInGallery
        ? "border-[var(--color-primary)] ring-2 ring-[rgb(var(--token-primary)/0.20)]"
        : "border-[var(--color-border)]",
    )}>
      <div className="aspect-square bg-[var(--color-muted)]">
        {item.mime.startsWith("image/") ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.url} alt={item.alt ?? ""} className="h-full w-full object-cover" loading="lazy" />
        ) : item.mime === "application/pdf" ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-3 text-center text-xs text-[var(--color-muted-fg)]">
            <FileText className="h-8 w-8" />
            <div className="truncate">PDF document</div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowPreview(true)}
                className="rounded-[var(--radius-sm)] bg-[var(--color-bg)] px-2 py-1 text-xs hover:bg-[var(--color-muted)]"
              >
                Preview
              </button>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-[var(--radius-sm)] bg-[var(--color-bg)] px-2 py-1 text-xs hover:bg-[var(--color-muted)]"
                title="Open in new tab"
              >
                Open <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        ) : (
          <div className="grid h-full w-full place-items-center text-xs text-[var(--color-muted-fg)]">
            {item.mime}
          </div>
        )}
      </div>

      {/* Gallery badge */}
      {item.showInGallery && (
        <div className="absolute left-2 top-2 rounded-full bg-[var(--color-primary)] px-2 py-0.5 text-[10px] font-semibold text-white shadow">
          Gallery
        </div>
      )}

      <figcaption className={cn("flex items-center justify-between gap-1 p-2", pending && "opacity-50")}>
        <button
          onClick={copy}
          aria-label="Copy media id"
          className="inline-flex items-center gap-1 truncate rounded-[var(--radius-sm)] px-2 py-1 text-xs hover:bg-[var(--color-muted)]"
          title={item.id}
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          <span className="truncate font-mono">{item.id.slice(0, 8)}&hellip;</span>
        </button>
        <div className="flex items-center gap-0.5">
          {item.mime.startsWith("image/") && (
            <button
              onClick={toggleGallery}
              disabled={pending}
              aria-label={item.showInGallery ? "Remove from gallery" : "Add to gallery"}
              title={item.showInGallery ? "Remove from gallery" : "Add to gallery"}
              className={cn(
                "rounded-[var(--radius-sm)] p-1.5 transition-colors",
                item.showInGallery
                  ? "text-[var(--color-primary)] hover:bg-[rgb(var(--token-primary)/0.10)]"
                  : "text-[var(--color-muted-fg)] hover:bg-[var(--color-muted)] hover:text-[var(--color-fg)]",
              )}
            >
              <ImageIcon className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={del}
            disabled={pending}
            aria-label="Delete media"
            className="rounded-[var(--radius-sm)] p-1.5 text-[var(--color-danger)] hover:bg-[rgb(var(--token-danger)/0.10)]"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </figcaption>
      {showPreview ? (
        <div
          role="presentation"
          onClick={() => setShowPreview(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-card)]"
          >
            <header className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-2">
              <div className="text-sm font-medium">Preview PDF</div>
              <div className="flex gap-2">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded px-2 py-1 text-xs hover:bg-[var(--color-muted)]"
                >
                  Open in new tab
                </a>
                <button
                  type="button"
                  onClick={() => setShowPreview(false)}
                  className="rounded px-2 py-1 text-xs hover:bg-[var(--color-muted)]"
                >
                  Close
                </button>
              </div>
            </header>
            <div className="h-[70vh]">
              <object data={item.url} type="application/pdf" className="h-full w-full">
                <div className="p-4 text-sm text-[var(--color-muted-fg)]">
                  Could not preview PDF — <a href={item.url} target="_blank" rel="noopener noreferrer">open in new tab</a>.
                </div>
              </object>
            </div>
          </div>
        </div>
      ) : null}
    </figure>
  );
}
