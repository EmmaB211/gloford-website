"use server";

import { revalidatePath } from "next/cache";
import { updateFeedbackSubmissionStatus } from "@/lib/services/feedbackSubmissions";
import { requireActorFromSession } from "@/lib/auth-context";

export async function updateFeedbackSubmissionStatusAction(raw: unknown) {
  await requireActorFromSession();
  const input = raw as { id?: string; status?: string } | null;
  if (!input?.id || !input?.status) throw new Error("Invalid submission");
  await updateFeedbackSubmissionStatus(input.id, input.status);
  revalidatePath("/admin/feedback-submissions");
}
