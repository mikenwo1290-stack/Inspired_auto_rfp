-- CreateTable
CREATE TABLE "knowledge_bases" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "knowledge_bases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_base_questions" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "topic" TEXT,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "knowledgeBaseId" TEXT NOT NULL,

    CONSTRAINT "knowledge_base_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_base_answers" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "questionId" TEXT NOT NULL,

    CONSTRAINT "knowledge_base_answers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "knowledge_bases_organizationId_idx" ON "knowledge_bases"("organizationId");

-- CreateIndex
CREATE INDEX "knowledge_base_questions_knowledgeBaseId_idx" ON "knowledge_base_questions"("knowledgeBaseId");

-- CreateIndex
CREATE UNIQUE INDEX "knowledge_base_answers_questionId_key" ON "knowledge_base_answers"("questionId");

-- AddForeignKey
ALTER TABLE "knowledge_bases" ADD CONSTRAINT "knowledge_bases_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_base_questions" ADD CONSTRAINT "knowledge_base_questions_knowledgeBaseId_fkey" FOREIGN KEY ("knowledgeBaseId") REFERENCES "knowledge_bases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_base_answers" ADD CONSTRAINT "knowledge_base_answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "knowledge_base_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
