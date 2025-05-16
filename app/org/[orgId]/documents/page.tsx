import React, { Suspense } from "react";
import { DocumentsContent } from "@/components/organizations/DocumentsContent";
import { PageSkeleton } from "@/components/projects/PageSkeleton";

interface DocumentsPageProps {
  params: Promise<{
    orgId: string;
  }>;
}

export default async function DocumentsPage({ params }: DocumentsPageProps) {
  const { orgId } = await params;
  
  return (
    <Suspense fallback={<PageSkeleton />}>
      <DocumentsContent orgId={orgId} />
    </Suspense>
  );
} 