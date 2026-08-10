import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";

// Mocks for dependencies used by the route handler
vi.mock("@/lib/ratelimit", () => ({
  clientIdentifier: vi.fn().mockReturnValue("test-client"),
  rateLimit: vi.fn().mockResolvedValue({ ok: true, remaining: 10, resetAt: new Date() }),
  tooManyRequests: vi.fn(),
}));

vi.mock("@/lib/storage/r2", () => ({
  saveFile: vi.fn().mockResolvedValue(undefined),
  publicUrlFor: vi.fn().mockImplementation((k: string) => `/api/media/file/${k}`),
  buildMediaKey: vi.fn().mockImplementation((name: string) => `key-${name}`),
}));

vi.mock("@/lib/auth-context", () => ({ requireActorFromSession: vi.fn() }));

vi.mock("@/lib/db", () => ({ db: { media: { create: vi.fn().mockResolvedValue({ id: "m_1", url: "/api/media/file/key-report.pdf" }) } } }));

vi.mock("next/cache", () => ({ revalidateTag: vi.fn() }));
vi.mock("@/lib/observability/sentry", () => ({ captureException: vi.fn() }));

describe("Reports upload API auth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects non-admin users with 403", async () => {
    const auth = await import("@/lib/auth-context");
    (auth.requireActorFromSession as unknown as Mock)?.mockResolvedValue?.({ userId: "u1", role: "VIEWER" });

    const { POST } = await import("@/app/api/reports/upload/route");

    const fakeFile = new File([new Uint8Array([1])], "report.pdf", { type: "application/pdf" });

    const req: any = {
      formData: async () => ({ get: (_: string) => fakeFile }),
      headers: new Map(),
    };

    const res: Response = await POST(req as unknown as Request) as unknown as Response;
    expect(res.status).toBe(403);
  });

  it("allows ADMIN users and returns created media", async () => {
    const auth = await import("@/lib/auth-context");
    (auth.requireActorFromSession as unknown as Mock)?.mockResolvedValue?.({ userId: "u1", role: "ADMIN" });

    const { POST } = await import("@/app/api/reports/upload/route");

    const fakeFile = new File([new Uint8Array([1])], "report.pdf", { type: "application/pdf" });

    const req: any = {
      formData: async () => ({ get: (_: string) => fakeFile }),
      headers: new Map(),
    };

    const res: any = await POST(req as unknown as Request);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("id");
    expect(body).toHaveProperty("url");
  });
});
