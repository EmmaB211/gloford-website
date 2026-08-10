import { db } from "@/lib/db";
import { notifyAdminOfSubmission } from "@/lib/mail/adminNotify";
import type { FeedbackSubmissionInput } from "@/lib/validators/feedbackSubmissions";

const ADMIN_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

type FeedbackSubmissionRow = {
  id: string;
  feedbackType: string;
  respondentCategory: string;
  respondentCategoryOther: string | null;
  feedbackSubject: string;
  feedbackSubjectOther: string | null;
  feedbackMessage: string;
  submissionMode: string;
  fullName: string | null;
  address: string | null;
  telephone: string | null;
  email: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

type FeedbackSubmissionDelegate = {
  create: (args: { data: Record<string, unknown> }) => Promise<FeedbackSubmissionRow>;
  findMany: (args: { orderBy?: { createdAt: "desc" }; skip?: number; take?: number }) => Promise<FeedbackSubmissionRow[]>;
  count: () => Promise<number>;
  findUnique: (args: { where: { id: string } }) => Promise<FeedbackSubmissionRow | null>;
  update: (args: { where: { id: string }; data: { status: string } }) => Promise<FeedbackSubmissionRow>;
};

const RESPONDENT_LABELS: Record<string, string> = {
  staff: "Staff",
  vocal_point_person: "Vocal Point Person",
  technical_person: "Technical Person",
  project_beneficiary: "Project Beneficiary",
  service_provider: "Service Provider",
  political_leader: "Political Leader",
  religious_leader: "Religious Leader",
  security_personnel: "Security Personnel",
  community: "Community / Neighbourhood",
  other: "Other",
};

const FEEDBACK_LABELS: Record<string, string> = {
  project: "Project",
  staff: "Staff",
  vandalism: "Vandalism",
  recklessness: "Recklessness",
  security: "Security",
  welfare: "Welfare",
  administration: "Administration",
  other: "Other",
};

function getFeedbackSubmissionDelegate(): FeedbackSubmissionDelegate | null {
  const delegate = (db as unknown as { feedbackSubmission?: unknown }).feedbackSubmission;
  return delegate && typeof delegate === "object" ? (delegate as FeedbackSubmissionDelegate) : null;
}

async function createViaSql(input: FeedbackSubmissionInput): Promise<FeedbackSubmissionRow> {
  const id = `fb_${crypto.randomUUID().replace(/-/g, "")}`;
  const rows = await db.$queryRawUnsafe<FeedbackSubmissionRow[]>(
    `INSERT INTO "FeedbackSubmission" ("id", "feedbackType", "respondentCategory", "respondentCategoryOther", "feedbackSubject", "feedbackSubjectOther", "feedbackMessage", "submissionMode", "fullName", "address", "telephone", "email", "status", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
     RETURNING *`,
    id,
    input.feedbackType,
    input.respondentCategory,
    input.respondentCategoryOther ?? null,
    input.feedbackSubject,
    input.feedbackSubjectOther ?? null,
    input.feedbackMessage,
    input.submissionMode,
    input.submissionMode === "identified" ? input.fullName ?? null : null,
    input.submissionMode === "identified" ? input.address ?? null : null,
    input.submissionMode === "identified" ? input.telephone ?? null : null,
    input.submissionMode === "identified" ? input.email ?? null : null,
    "New",
  );

  if (!rows[0]) {
    throw new Error("Feedback submission could not be created.");
  }

  return rows[0];
}

async function listViaSql({ page = 1, perPage = 50 }: { page?: number; perPage?: number } = {}) {
  const [rows, totalRows] = await Promise.all([
    db.$queryRawUnsafe<FeedbackSubmissionRow[]>(
      `SELECT * FROM "FeedbackSubmission" ORDER BY "createdAt" DESC LIMIT $1 OFFSET $2`,
      perPage,
      (page - 1) * perPage,
    ),
    db.$queryRawUnsafe<{ count: number }[]>(`SELECT COUNT(*)::int as count FROM "FeedbackSubmission"`),
  ]);

  const total = totalRows[0]?.count ?? 0;
  return { rows, total, page, perPage, totalPages: Math.ceil(total / perPage) };
}

async function getByIdViaSql(id: string) {
  const rows = await db.$queryRawUnsafe<FeedbackSubmissionRow[]>(`SELECT * FROM "FeedbackSubmission" WHERE "id" = $1 LIMIT 1`, id);
  return rows[0] ?? null;
}

async function updateStatusViaSql(id: string, status: string) {
  const rows = await db.$queryRawUnsafe<FeedbackSubmissionRow[]>(
    `UPDATE "FeedbackSubmission" SET "status" = $1, "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = $2 RETURNING *`,
    status,
    id,
  );
  return rows[0] ?? null;
}

export async function createFeedbackSubmission(input: FeedbackSubmissionInput) {
  const delegate = getFeedbackSubmissionDelegate();
  const row = delegate
    ? await delegate.create({
        data: {
          feedbackType: input.feedbackType,
          respondentCategory: input.respondentCategory,
          respondentCategoryOther: input.respondentCategoryOther ?? null,
          feedbackSubject: input.feedbackSubject,
          feedbackSubjectOther: input.feedbackSubjectOther ?? null,
          feedbackMessage: input.feedbackMessage,
          submissionMode: input.submissionMode,
          fullName: input.submissionMode === "identified" ? input.fullName ?? null : null,
          address: input.submissionMode === "identified" ? input.address ?? null : null,
          telephone: input.submissionMode === "identified" ? input.telephone ?? null : null,
          email: input.submissionMode === "identified" ? input.email ?? null : null,
          status: "New",
        },
      })
    : await createViaSql(input);

  void notifyAdminOfSubmission({
    type: "contact",
    subject: `New GLOFORD Feedback Submission — ${input.feedbackType}`,
    details: {
      "Feedback Type": input.feedbackType,
      "Respondent Category": RESPONDENT_LABELS[input.respondentCategory] ?? input.respondentCategory,
      "Respondent Category Other": input.respondentCategoryOther ?? "—",
      "Feedback Subject": FEEDBACK_LABELS[input.feedbackSubject] ?? input.feedbackSubject,
      "Feedback Subject Other": input.feedbackSubjectOther ?? "—",
      "Submission Mode": input.submissionMode === "anonymous" ? "Anonymous" : "Identified",
      "Name": input.submissionMode === "identified" ? input.fullName ?? "—" : "Anonymous",
      "Telephone": input.submissionMode === "identified" ? input.telephone ?? "—" : "Anonymous",
      "Email": input.submissionMode === "identified" ? input.email ?? "—" : "Anonymous",
      Message: input.feedbackMessage,
    },
    adminUrl: `${ADMIN_URL}/admin/feedback-submissions`,
  });

  return row;
}

export async function listFeedbackSubmissions({ page = 1, perPage = 50 }: { page?: number; perPage?: number } = {}) {
  const delegate = getFeedbackSubmissionDelegate();
  if (delegate) {
    const [rows, total] = await Promise.all([
      delegate.findMany({
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      delegate.count(),
    ]);

    return { rows, total, page, perPage, totalPages: Math.ceil(total / perPage) };
  }

  return listViaSql({ page, perPage });
}

export async function getFeedbackSubmissionById(id: string) {
  const delegate = getFeedbackSubmissionDelegate();
  if (delegate) {
    return delegate.findUnique({ where: { id } });
  }

  return getByIdViaSql(id);
}

export async function updateFeedbackSubmissionStatus(id: string, status: string) {
  const delegate = getFeedbackSubmissionDelegate();
  if (delegate) {
    return delegate.update({ where: { id }, data: { status } });
  }

  return updateStatusViaSql(id, status);
}
