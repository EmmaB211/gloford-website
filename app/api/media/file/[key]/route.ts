import { readFile } from "node:fs/promises";
import { join, resolve, normalize, sep } from "node:path";
import { NextResponse } from "next/server";
import { uploadDir } from "@/lib/storage/r2";

export const runtime = "nodejs";

// Only allow safe key characters — no path traversal (CWE-22)
const SAFE_KEY = /^[a-z0-9._-]+$/i;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  const { key } = await params;
  if (!SAFE_KEY.test(key)) {
    const headers: Record<string, string> = {};
    if (process.env.NODE_ENV !== "production") headers["X-Media-SafeKey"] = "false";
    return new NextResponse("Not found", { status: 404, headers });
  }
  const base = resolve(uploadDir());
  const target = normalize(join(base, key));
  // Double-check resolved path stays within upload directory
  if (!target.startsWith(base + sep)) {
    const headers: Record<string, string> = {};
    if (process.env.NODE_ENV !== "production") {
      headers["X-Media-Resolved"] = target;
      headers["X-Media-Base"] = base;
    }
    return new NextResponse("Not found", { status: 404, headers });
  }
  try {
    const buf = await readFile(target);
    const ext = key.split(".").pop()?.toLowerCase() ?? "";
    const MIME: Record<string, string> = {
      pdf: "application/pdf",
      svg: "image/svg+xml",
      png: "image/png",
      gif: "image/gif",
      webp: "image/webp",
      avif: "image/avif",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
    };
    const mime = MIME[ext] ?? "image/jpeg";
    const headers: Record<string, string> = {
      "Content-Type": mime,
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Disposition": "inline",
      "X-Content-Type-Options": "nosniff",
    };
    // For PDFs, avoid the restrictive sandbox CSP so browsers can render PDFs inline.
    if (mime !== "application/pdf") {
      headers["Content-Security-Policy"] = "default-src 'none'; script-src 'none'; sandbox";
    }
    if (process.env.NODE_ENV !== "production") headers["X-Media-Resolved"] = target;
    return new NextResponse(buf, { headers });
  } catch {
    const headers: Record<string, string> = {};
    if (process.env.NODE_ENV !== "production") headers["X-Media-Resolved"] = target;
    return new NextResponse("Not found", { status: 404, headers });
  }
}
