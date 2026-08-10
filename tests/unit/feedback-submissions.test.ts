import { describe, expect, it } from "vitest";
import { sanitizeFeedbackText, validateFeedbackSubmissionInput } from "@/lib/validators/feedbackSubmissions";

function buildFeedbackSubmissionPayload() {
  return {
    feedbackType: "complaint",
    respondentCategory: "political_leader",
    feedbackSubject: "vandalism",
    feedbackMessage: "Chairs have been left out after seminar",
    submissionMode: "anonymous" as const,
    consent: true,
  };
}

describe("feedback submission validation", () => {
  it("requires the core fields for anonymous submissions", () => {
    const result = validateFeedbackSubmissionInput({
      feedbackType: "suggestion",
      respondentCategory: "staff",
      feedbackSubject: "project",
      feedbackMessage: "",
      submissionMode: "anonymous",
      consent: false,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path.includes("feedbackMessage"))).toBe(true);
      expect(result.error.issues.some((issue) => issue.path.includes("consent"))).toBe(true);
    }
  });

  it("requires contact details when the submission is identified", () => {
    const result = validateFeedbackSubmissionInput({
      feedbackType: "complaint",
      respondentCategory: "other",
      respondentCategoryOther: "Local volunteer",
      feedbackSubject: "other",
      feedbackSubjectOther: "Security",
      feedbackMessage: "Need better lighting",
      submissionMode: "identified",
      fullName: "",
      address: "",
      telephone: "",
      email: "",
      consent: true,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path.includes("fullName"))).toBe(true);
      expect(result.error.issues.some((issue) => issue.path.includes("address"))).toBe(true);
      expect(result.error.issues.some((issue) => issue.path.includes("telephone"))).toBe(true);
    }
  });

  it("sanitizes dangerous text and trims whitespace", () => {
    expect(sanitizeFeedbackText("  <script>alert('x')</script> Need help  ")).toBe("Need help");
    expect(sanitizeFeedbackText("  Community feedback  ")).toBe("Community feedback");
  });

  it("accepts a valid anonymous submission payload", () => {
    const payload = buildFeedbackSubmissionPayload();
    const result = validateFeedbackSubmissionInput(payload);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.feedbackMessage).toContain("Chairs");
      expect(result.data.submissionMode).toBe("anonymous");
    }
  });
});
