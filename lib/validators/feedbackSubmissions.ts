import { z } from "zod";

const feedbackTypeSchema = z.enum(["suggestion", "complaint", "compliment"]);
const respondentCategorySchema = z.enum([
  "staff",
  "vocal_point_person",
  "technical_person",
  "project_beneficiary",
  "service_provider",
  "political_leader",
  "religious_leader",
  "security_personnel",
  "community",
  "other",
]);
const feedbackSubjectSchema = z.enum([
  "project",
  "staff",
  "vandalism",
  "recklessness",
  "security",
  "welfare",
  "administration",
  "other",
]);
const submissionModeSchema = z.enum(["anonymous", "identified"]);

export const feedbackSubmissionSchema = z.object({
  feedbackType: feedbackTypeSchema,
  respondentCategory: respondentCategorySchema,
  respondentCategoryOther: z.string().trim().max(200).optional(),
  feedbackSubject: feedbackSubjectSchema,
  feedbackSubjectOther: z.string().trim().max(200).optional(),
  feedbackMessage: z.string().trim().min(1).max(2000),
  submissionMode: submissionModeSchema,
  fullName: z.string().trim().max(200).optional(),
  address: z.string().trim().max(400).optional(),
  telephone: z.string().trim().max(50).optional(),
  email: z.string().trim().email().max(320).optional().or(z.literal("")),
  consent: z.boolean().refine((value) => value, { message: "Please accept the confirmation statement." }),
}).superRefine((data, ctx) => {
  if (data.submissionMode === "identified") {
    if (!data.fullName?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["fullName"], message: "Please provide your name." });
    }
    if (!data.address?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["address"], message: "Please provide your address." });
    }
    if (!data.telephone?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["telephone"], message: "Please provide your telephone number." });
    }
  }

  if (data.respondentCategory === "other" && !data.respondentCategoryOther?.trim()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["respondentCategoryOther"], message: "Please specify your category." });
  }

  if (data.feedbackSubject === "other" && !data.feedbackSubjectOther?.trim()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["feedbackSubjectOther"], message: "Please specify the subject." });
  }
});

export function validateFeedbackSubmissionInput(raw: unknown) {
  return feedbackSubmissionSchema.safeParse(raw);
}

export function sanitizeFeedbackText(value: string) {
  return value
    .replace(/<script[^>]*>.*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export type FeedbackSubmissionInput = z.infer<typeof feedbackSubmissionSchema>;
