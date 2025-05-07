-- CreateTable
CREATE TABLE "sources" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT,
    "pageNumber" TEXT,
    "documentId" TEXT,
    "relevance" INTEGER,
    "textContent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "answerId" TEXT NOT NULL,

    CONSTRAINT "sources_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sources_answerId_idx" ON "sources"("answerId");

-- AddForeignKey
ALTER TABLE "sources" ADD CONSTRAINT "sources_answerId_fkey" FOREIGN KEY ("answerId") REFERENCES "answers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
