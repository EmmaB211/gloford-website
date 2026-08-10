"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, CheckCircle2, Clock3, Mail, Phone } from "lucide-react";
import { updateFeedbackSubmissionStatusAction } from "./actions";

type Submission = {
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
  createdAt: Date | string;
};

const statusOptions = ["New", "Under Review", "Resolved", "Closed"];

export function FeedbackSubmissionsClient({ submissions }: { submissions: Submission[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Submission | null>(submissions[0] ?? null);
  const [error, setError] = useState<string | null>(null);

  const counts = useMemo(() => ({
    new: submissions.filter((item) => item.status === "New").length,
    review: submissions.filter((item) => item.status === "Under Review").length,
  }), [submissions]);

  async function changeStatus(id: string, status: string) {
    setError(null);
    try {
      await updateFeedbackSubmissionStatusAction({ id, status });
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to update status");
    }
  }

  function formatDate(value: Date | string) {
    return new Date(value).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div className="space-y-6">
      {error ? <div role="alert" className="rounded-lg border border-[var(--color-danger)] bg-[rgb(var(--token-danger)/0.08)] p-3 text-sm text-[var(--color-danger)]">{error}</div> : null}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Suggestion Box / Feedback</h1>
          <p className="mt-1 text-sm text-[var(--color-muted-fg)]">Review community feedback and update the status of each submission.</p>
        </div>
        <div className="flex gap-2 text-sm text-[var(--color-muted-fg)]">
          <span className="rounded-full bg-[rgb(var(--token-primary)/0.10)] px-3 py-1">{counts.new} new</span>
          <span className="rounded-full bg-[rgb(var(--token-muted)/0.40)] px-3 py-1">{counts.review} under review</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-2 lg:col-span-1">
          {submissions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[var(--color-border)] p-8 text-center text-sm text-[var(--color-muted-fg)]">No feedback submissions yet.</div>
          ) : submissions.map((submission) => (
            <button key={submission.id} onClick={() => setSelected(submission)} className={`w-full rounded-xl border p-4 text-left transition ${selected?.id === submission.id ? "border-[var(--color-primary)] bg-[rgb(var(--token-primary)/0.10)]" : "border-[var(--color-border)] hover:bg-[rgb(var(--token-muted)/0.30)]"}`}>
              <div className="flex items-center justify-between gap-3">
                <span className="font-semibold text-[var(--color-fg)]">{submission.feedbackType}</span>
                <span className="rounded-full bg-[rgb(var(--token-muted)/0.50)] px-2 py-1 text-[11px] uppercase tracking-[0.14em] text-[var(--color-muted-fg)]">{submission.status}</span>
              </div>
              <p className="mt-2 text-sm text-[var(--color-muted-fg)]">{submission.feedbackMessage.slice(0, 120)}{submission.feedbackMessage.length > 120 ? "…" : ""}</p>
              <p className="mt-2 text-xs text-[var(--color-muted-fg)]">{formatDate(submission.createdAt)}</p>
            </button>
          ))}
        </div>

        <div className="lg:col-span-2">
          {selected ? (
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-[var(--color-fg)]">{selected.feedbackType}</h2>
                  <p className="text-sm text-[var(--color-muted-fg)]">Submitted {formatDate(selected.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-[var(--color-border)] px-3 py-2 text-sm">
                  {selected.status === "New" ? <Clock3 className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                  {selected.status}
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-[var(--color-border)] bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-muted-fg)]">Category</p>
                  <p className="mt-1 font-medium text-[var(--color-fg)]">{selected.respondentCategory === "other" ? selected.respondentCategoryOther ?? "Other" : selected.respondentCategory}</p>
                </div>
                <div className="rounded-xl border border-[var(--color-border)] bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-muted-fg)]">Subject</p>
                  <p className="mt-1 font-medium text-[var(--color-fg)]">{selected.feedbackSubject === "other" ? selected.feedbackSubjectOther ?? "Other" : selected.feedbackSubject}</p>
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-[var(--color-border)] bg-white p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-muted-fg)]">Feedback</p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[var(--color-fg)]">{selected.feedbackMessage}</p>
              </div>

              {selected.submissionMode === "identified" ? (
                <div className="mt-6 rounded-xl border border-[var(--color-border)] bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-muted-fg)]">Contact Details</p>
                  <div className="mt-3 space-y-2 text-sm text-[var(--color-fg)]">
                    {selected.fullName ? <div className="flex items-center gap-2"><Eye className="h-4 w-4" /> {selected.fullName}</div> : null}
                    {selected.address ? <div className="flex items-center gap-2"><Eye className="h-4 w-4" /> {selected.address}</div> : null}
                    {selected.telephone ? <div className="flex items-center gap-2"><Phone className="h-4 w-4" /> {selected.telephone}</div> : null}
                    {selected.email ? <div className="flex items-center gap-2"><Mail className="h-4 w-4" /> {selected.email}</div> : null}
                  </div>
                </div>
              ) : (
                <div className="mt-6 rounded-xl border border-[var(--color-border)] bg-[rgb(var(--token-muted)/0.25)] p-4 text-sm text-[var(--color-muted-fg)]">Anonymous Submission</div>
              )}

              <div className="mt-6">
                <label htmlFor="status" className="mb-2 block text-sm font-medium text-[var(--color-fg)]">Update status</label>
                <select id="status" value={selected.status} onChange={(event) => changeStatus(selected.id, event.target.value)} className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-sm">
                  {statusOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
