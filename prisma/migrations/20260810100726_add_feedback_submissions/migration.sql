-- CreateTable
CREATE TABLE "FeedbackSubmission" (
    "id" TEXT NOT NULL,
    "feedbackType" TEXT NOT NULL,
    "respondentCategory" TEXT NOT NULL,
    "respondentCategoryOther" TEXT,
    "feedbackSubject" TEXT NOT NULL,
    "feedbackSubjectOther" TEXT,
    "feedbackMessage" TEXT NOT NULL,
    "submissionMode" TEXT NOT NULL DEFAULT 'anonymous',
    "fullName" TEXT,
    "address" TEXT,
    "telephone" TEXT,
    "email" TEXT,
    "status" TEXT NOT NULL DEFAULT 'New',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "FeedbackSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FeedbackSubmission_status_createdAt_idx" ON "FeedbackSubmission"("status", "createdAt");

-- CreateIndex
CREATE INDEX "FeedbackSubmission_feedbackType_createdAt_idx" ON "FeedbackSubmission"("feedbackType", "createdAt");

-- CreateIndex
CREATE INDEX "FeedbackSubmission_submissionMode_createdAt_idx" ON "FeedbackSubmission"("submissionMode", "createdAt");
