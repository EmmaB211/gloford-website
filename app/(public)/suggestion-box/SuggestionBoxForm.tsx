"use client";

import { useMemo, useState, useTransition } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { submitSuggestionBoxAction } from "./actions";

const inputCls =
  "w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-sm transition focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--token-primary)/0.20)]";

const feedbackTypes = [
  { value: "suggestion", label: "Suggestion" },
  { value: "complaint", label: "Complaint" },
  { value: "compliment", label: "Compliment" },
];

const respondentCategories = [
  { value: "staff", label: "Staff" },
  { value: "vocal_point_person", label: "Vocal Point Person" },
  { value: "technical_person", label: "Technical Person" },
  { value: "project_beneficiary", label: "Project Beneficiary" },
  { value: "service_provider", label: "Service Provider" },
  { value: "political_leader", label: "Political Leader" },
  { value: "religious_leader", label: "Religious Leader" },
  { value: "security_personnel", label: "Security Personnel" },
  { value: "community", label: "Community / Neighbourhood" },
  { value: "other", label: "Other (Specify)" },
];

const feedbackSubjects = [
  { value: "project", label: "Project" },
  { value: "staff", label: "Staff" },
  { value: "vandalism", label: "Vandalism" },
  { value: "recklessness", label: "Recklessness" },
  { value: "security", label: "Security" },
  { value: "welfare", label: "Welfare" },
  { value: "administration", label: "Administration" },
  { value: "other", label: "Other (Specify)" },
];

export function SuggestionBoxForm() {
  const [feedbackType, setFeedbackType] = useState("suggestion");
  const [respondentCategory, setRespondentCategory] = useState("staff");
  const [feedbackSubject, setFeedbackSubject] = useState("project");
  const [submissionMode, setSubmissionMode] = useState("anonymous");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  const messageLength = useMemo(() => feedbackMessage.length, [feedbackMessage]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = event.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      try {
        await submitSuggestionBoxAction(formData);
        form.reset();
        setFeedbackType("suggestion");
        setRespondentCategory("staff");
        setFeedbackSubject("project");
        setSubmissionMode("anonymous");
        setFeedbackMessage("");
        setSuccess(true);
      } catch (err) {
        setSuccess(false);
        setError(err instanceof Error ? err.message : "We couldn't submit your feedback. Please try again.");
      }
    });
  }

  if (success) {
    return (
      <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] p-8 shadow-sm">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[rgb(var(--token-success)/0.10)]">
            <CheckCircle2 className="h-8 w-8 text-[var(--color-success)]" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-2xl font-semibold text-[var(--color-fg)]">Thank you for your feedback!</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-sm leading-7 text-[var(--color-muted-fg)]">
          Your feedback has been successfully received by GLOFORD Uganda. We appreciate you taking the time to help us improve our work.
        </p>
        <p className="mx-auto mt-4 max-w-2xl text-center text-sm leading-7 text-[var(--color-muted-fg)]">
          If you provided your contact details, the relevant team may contact you for follow-up.
        </p>
        <button
          type="button"
          onClick={() => setSuccess(false)}
          className="mx-auto mt-6 inline-flex rounded-full border border-[var(--color-primary)] px-5 py-2 text-sm font-semibold text-[var(--color-primary)]"
        >
          Submit another response
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-sm sm:p-8">
      <div className="mb-8 space-y-2">
        <h2 className="text-2xl font-semibold text-[var(--color-fg)]">Share your feedback</h2>
        <p className="text-sm leading-7 text-[var(--color-muted-fg)]">
          Your feedback will be handled confidentially and used to improve our programmes, services, and operations.
        </p>
      </div>

      {error ? (
        <div role="alert" className="mb-6 rounded-xl border border-[rgb(var(--token-danger)/0.25)] bg-[rgb(var(--token-danger)/0.10)] p-3 text-sm text-[var(--color-danger)]">
          {error}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="space-y-4 rounded-2xl border border-[var(--color-border)] bg-white p-5">
          <h3 className="text-lg font-semibold text-[var(--color-fg)]">Type of feedback</h3>
          <div>
            <label htmlFor="feedbackType" className="mb-2 block text-sm font-medium text-[var(--color-fg)]">
              What would you like to submit?
            </label>
            <select id="feedbackType" name="feedbackType" value={feedbackType} onChange={(e) => setFeedbackType(e.target.value)} className={inputCls} required>
              <option value="">Select one</option>
              {feedbackTypes.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-[var(--color-border)] bg-white p-5">
          <h3 className="text-lg font-semibold text-[var(--color-fg)]">Who are you?</h3>
          <div>
            <label htmlFor="respondentCategory" className="mb-2 block text-sm font-medium text-[var(--color-fg)]">
              Which category best describes you?
            </label>
            <select id="respondentCategory" name="respondentCategory" value={respondentCategory} onChange={(e) => setRespondentCategory(e.target.value)} className={inputCls} required>
              <option value="">Select one</option>
              {respondentCategories.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </div>
          {respondentCategory === "other" ? (
            <div>
              <label htmlFor="respondentCategoryOther" className="mb-2 block text-sm font-medium text-[var(--color-fg)]">Please specify</label>
              <input id="respondentCategoryOther" name="respondentCategoryOther" className={inputCls} placeholder="Tell us how you would describe yourself" />
            </div>
          ) : null}
        </section>

        <section className="space-y-4 rounded-2xl border border-[var(--color-border)] bg-white p-5">
          <h3 className="text-lg font-semibold text-[var(--color-fg)]">What is your feedback about?</h3>
          <div>
            <label htmlFor="feedbackSubject" className="mb-2 block text-sm font-medium text-[var(--color-fg)]">
              Your feedback is about
            </label>
            <select id="feedbackSubject" name="feedbackSubject" value={feedbackSubject} onChange={(e) => setFeedbackSubject(e.target.value)} className={inputCls} required>
              <option value="">Select one</option>
              {feedbackSubjects.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </div>
          {feedbackSubject === "other" ? (
            <div>
              <label htmlFor="feedbackSubjectOther" className="mb-2 block text-sm font-medium text-[var(--color-fg)]">Please specify</label>
              <input id="feedbackSubjectOther" name="feedbackSubjectOther" className={inputCls} placeholder="Tell us more about the subject" />
            </div>
          ) : null}
        </section>

        <section className="space-y-4 rounded-2xl border border-[var(--color-border)] bg-white p-5">
          <h3 className="text-lg font-semibold text-[var(--color-fg)]">Your feedback</h3>
          <div>
            <label htmlFor="feedbackMessage" className="mb-2 block text-sm font-medium text-[var(--color-fg)]">
              Please provide your suggestion, complaint, compliment, or other feedback
            </label>
            <textarea
              id="feedbackMessage"
              name="feedbackMessage"
              rows={8}
              maxLength={2000}
              value={feedbackMessage}
              onChange={(event) => setFeedbackMessage(event.target.value)}
              className={inputCls}
              placeholder="Please provide as much detail as possible. Do not include sensitive personal information unless it is necessary for us to address your concern."
              required
            />
            <div className="mt-2 flex justify-between text-xs text-[var(--color-muted-fg)]">
              <span>Maximum 2,000 characters</span>
              <span>{messageLength}/2000</span>
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-[var(--color-border)] bg-white p-5">
          <h3 className="text-lg font-semibold text-[var(--color-fg)]">How would you like us to handle your feedback?</h3>
          <div className="space-y-3">
            <label className="flex items-start gap-3 rounded-xl border border-[var(--color-border)] p-3">
              <input type="radio" name="submissionMode" value="anonymous" checked={submissionMode === "anonymous"} onChange={() => setSubmissionMode("anonymous")} className="mt-1" />
              <span>
                <span className="block font-medium text-[var(--color-fg)]">Stay Anonymous</span>
                <span className="text-sm text-[var(--color-muted-fg)]">We will only use the feedback you provide.</span>
              </span>
            </label>
            <label className="flex items-start gap-3 rounded-xl border border-[var(--color-border)] p-3">
              <input type="radio" name="submissionMode" value="identified" checked={submissionMode === "identified"} onChange={() => setSubmissionMode("identified")} className="mt-1" />
              <span>
                <span className="block font-medium text-[var(--color-fg)]">Provide My Contact Details</span>
                <span className="text-sm text-[var(--color-muted-fg)]">We may contact you for follow-up.</span>
              </span>
            </label>
          </div>

          {submissionMode === "identified" ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="fullName" className="mb-2 block text-sm font-medium text-[var(--color-fg)]">Full Name</label>
                <input id="fullName" name="fullName" className={inputCls} placeholder="Your full name" />
              </div>
              <div>
                <label htmlFor="address" className="mb-2 block text-sm font-medium text-[var(--color-fg)]">Address</label>
                <input id="address" name="address" className={inputCls} placeholder="Your address" />
              </div>
              <div>
                <label htmlFor="telephone" className="mb-2 block text-sm font-medium text-[var(--color-fg)]">Telephone Number</label>
                <input id="telephone" name="telephone" className={inputCls} placeholder="Your phone number" />
              </div>
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-[var(--color-fg)]">Email Address (optional)</label>
                <input id="email" name="email" type="email" className={inputCls} placeholder="you@example.org" />
              </div>
            </div>
          ) : null}

          <p className="rounded-xl bg-[rgb(var(--token-muted)/0.40)] p-3 text-sm leading-7 text-[var(--color-muted-fg)]">
            Your contact information will only be used for purposes related to responding to or following up on your feedback and will be handled confidentially.
          </p>
        </section>

        <section className="rounded-2xl border border-[var(--color-border)] bg-white p-5">
          <label className="flex items-start gap-3 text-sm leading-7 text-[var(--color-fg)]">
            <input type="checkbox" name="consent" className="mt-1 h-4 w-4" required />
            <span>
              I confirm that the information provided is accurate to the best of my knowledge and I understand that GLOFORD may use this feedback to improve its programmes, services, and operations.
            </span>
          </label>
        </section>

        <button type="submit" disabled={pending} className="inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)] px-8 py-3 font-semibold text-white transition hover:shadow-lg disabled:opacity-50">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {pending ? "Submitting…" : "Submit Feedback"}
        </button>
      </form>
    </div>
  );
}
