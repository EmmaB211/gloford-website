import { requireActorFromSession } from "@/lib/auth-context";
import { listFeedbackSubmissions } from "@/lib/services/feedbackSubmissions";
import { FeedbackSubmissionsClient } from "./FeedbackSubmissionsClient";

export const metadata = { title: "Feedback Submissions", robots: { index: false, follow: false } };

export default async function FeedbackSubmissionsPage() {
  await requireActorFromSession();
  const { rows } = await listFeedbackSubmissions({ page: 1, perPage: 100 });
  return <FeedbackSubmissionsClient submissions={rows} />;
}
