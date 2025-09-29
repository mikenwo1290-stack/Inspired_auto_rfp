-- Create proposal_templates table
CREATE TABLE "proposal_templates" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "fileKey" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "organizationId" TEXT NOT NULL,
    "uploadedById" TEXT,
    "metadata" JSONB,
    CONSTRAINT "proposal_templates_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "proposal_templates_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "proposal_templates_organizationId_idx" ON "proposal_templates" ("organizationId");

-- Create proposals table
CREATE TABLE "proposals" (
    "id" TEXT PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "fileKey" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "generatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "generatedById" TEXT,
    "status" TEXT DEFAULT 'generated' NOT NULL,
    "data" JSONB NOT NULL,
    CONSTRAINT "proposals_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "proposals_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "proposal_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "proposals_generatedById_fkey" FOREIGN KEY ("generatedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "proposals_organizationId_idx" ON "proposals" ("organizationId");
CREATE INDEX "proposals_templateId_idx" ON "proposals" ("templateId");
