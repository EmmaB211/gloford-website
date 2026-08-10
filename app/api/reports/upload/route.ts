import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { clientIdentifier, rateLimit, tooManyRequests } from "@/lib/ratelimit";
import { saveFile, publicUrlFor, buildMediaKey } from "@/lib/storage/r2";
import { toSafeError, isAppError } from "@/lib/errors";
import { captureException } from "@/lib/observability/sentry";
import { db } from "@/lib/db";
import { requireActorFromSession } from "@/lib/auth-context";

export const runtime = "nodejs";

const ALLOWED_MIME = new Set(["application/pdf"]);
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB for public uploads

export async function POST(req: Request) {
  try {
    // Ensure only authenticated admins can upload
    const actor = await requireActorFromSession();
    if (actor.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const rl = await rateLimit({ bucket: "reports-upload", identifier: clientIdentifier(req), limit: 10, windowSeconds: 3600 });
    if (!rl.ok) return tooManyRequests(rl, "Too many uploads");

    const form = await req.formData();
    const file = form.get("file");
    if (!file || typeof file === "string" || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (!ALLOWED_MIME.has(file.type)) {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "File exceeds 10 MB limit" }, { status: 400 });
    }

    const key = buildMediaKey(file.name);
    const buffer = Buffer.from(await file.arrayBuffer());
    await saveFile(key, buffer);
    const url = publicUrlFor(key);

    // Create a Media row so the upload appears in the admin media library.
    const row = await db.media.create({
      data: {
        url,
        key,
        mime: file.type,
        sizeBytes: file.size,
        uploadedById: null,
      },
      select: { id: true, url: true },
    });

    try { revalidateTag("media"); } catch { /* non-critical */ }

    return NextResponse.json(row);
  } catch (e) {
    captureException(e, { route: "POST /api/reports/upload" });
    const safe = toSafeError(e);
    return NextResponse.json({ error: safe.message, code: safe.code }, { status: isAppError(e) ? e.status : 500 });
  }
}
