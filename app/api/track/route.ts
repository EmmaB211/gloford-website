import { NextRequest, NextResponse } from "next/server";
import { recordVisit } from "@/lib/services/siteVisits";
import { rateLimit, tooManyRequests, clientIdentifier } from "@/lib/ratelimit";

const MAX_PATH = 2048;
const MAX_STR = 512;

function clamp(v: unknown, max: number): string | null {
  if (typeof v !== "string" || !v) return null;
  return v.slice(0, max);
}

export async function POST(req: NextRequest) {
  const rl = await rateLimit({
    bucket: "track",
    identifier: clientIdentifier(req),
    limit: 60,
    windowSeconds: 60,
  });
  if (!rl.ok) return tooManyRequests(rl);

  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ ok: false, error: "Invalid request body" }, { status: 400 });
    }

    // Derive IP server-side — never trust client-supplied IP
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim().slice(0, 45) ??
      null;

    await recordVisit({
      path: clamp((body as any).path, MAX_PATH) ?? "/",
      referrer: clamp((body as any).referrer, MAX_STR),
      userAgent: clamp((body as any).userAgent, MAX_STR),
      ip,
      country: clamp((body as any).country, 2),
      city: clamp((body as any).city, 100),
      sessionId: clamp((body as any).sessionId, 64),
      userId: clamp((body as any).userId, 64),
    });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Unexpected error" },
      { status: 500 },
    );
  }
}
