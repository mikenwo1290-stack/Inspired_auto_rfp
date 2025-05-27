-- AlterTable
ALTER TABLE "questions" ADD COLUMN     "referenceId" TEXT;

-- CreateIndex
CREATE INDEX "questions_projectId_referenceId_idx" ON "questions"("projectId", "referenceId");
