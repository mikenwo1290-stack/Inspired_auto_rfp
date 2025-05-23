-- CreateTable
CREATE TABLE "project_indexes" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "indexId" TEXT NOT NULL,
    "indexName" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "project_indexes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "project_indexes_projectId_idx" ON "project_indexes"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "project_indexes_projectId_indexId_key" ON "project_indexes"("projectId", "indexId");

-- AddForeignKey
ALTER TABLE "project_indexes" ADD CONSTRAINT "project_indexes_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
