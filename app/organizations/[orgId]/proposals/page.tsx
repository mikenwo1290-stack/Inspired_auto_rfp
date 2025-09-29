import { Suspense } from "react";

import { PageSkeleton } from "@/components/projects/PageSkeleton";
import { ProposalGenerationContent } from "@/components/organizations";

interface ProposalPageProps {
  params: Promise<{ orgId: string }>;
}

export default function ProposalPage({ params }: ProposalPageProps) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ProposalPageContent params={params} />
    </Suspense>
  );
}

function ProposalPageContent({ params }: ProposalPageProps) {
  return <ProposalGenerationContent params={params} />;
}

