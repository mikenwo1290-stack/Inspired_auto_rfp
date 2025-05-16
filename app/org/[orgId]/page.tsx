import React, { Suspense } from "react";
import { OrganizationContent } from "@/components/organizations/OrganizationContent";
import { PageSkeleton } from "@/components/projects/PageSkeleton";

interface OrganizationPageProps {
  params: Promise<{ orgId: string }>;
}

export default async function OrganizationPage({ params }: OrganizationPageProps) {
  const { orgId } = await params;
  
  return (
    <Suspense fallback={<PageSkeleton />}>
      <OrganizationContent orgId={orgId} />
    </Suspense>
  );
} 