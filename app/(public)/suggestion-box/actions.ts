"use server";

import { headers } from "next/headers";
import { createFeedbackSubmission } from "@/lib/services/feedbackSubmissions";
import { rateLimit } from "@/lib/ratelimit";
import { ValidationError } from "@/lib/errors";
import { validateFeedbackSubmissionInput, sanitizeFeedbackText } from "@/lib/validators/feedbackSubmissions";

export async function submitSuggestionBoxAction(formData: FormData) {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? "unknown";
  const rl = await rateLimit({ bucket: "feedback-submit", identifier: ip, limit: 5, windowSeconds: 3600 });
  if (!rl.ok) {
    throw new ValidationError("Too many submissions — please try again later.");
  }

  const payload = {
    feedbackType: (formData.get("feedbackType") as string | null) ?? undefined,
    respondentCategory: (formData.get("respondentCategory") as string | null) ?? undefined,
    respondentCategoryOther: (formData.get("respondentCategoryOther") as string | null) ?? undefined,
    feedbackSubject: (formData.get("feedbackSubject") as string | null) ?? undefined,
    feedbackSubjectOther: (formData.get("feedbackSubjectOther") as string | null) ?? undefined,
    feedbackMessage: sanitizeFeedbackText((formData.get("feedbackMessage") as string | null) ?? ""),
    submissionMode: (formData.get("submissionMode") as string | null) ?? "anonymous",
    fullName: sanitizeFeedbackText((formData.get("fullName") as string | null) ?? ""),
    address: sanitizeFeedbackText((formData.get("address") as string | null) ?? ""),
    telephone: sanitizeFeedbackText((formData.get("telephone") as string | null) ?? ""),
    email: (formData.get("email") as string | null) ?? "",
    consent: formData.get("consent") === "on",
  };

  const parsed = validateFeedbackSubmissionInput(payload);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    throw new ValidationError(issue?.message ?? "Please complete the required fields.");
  }

  await createFeedbackSubmission(parsed.data);
}
