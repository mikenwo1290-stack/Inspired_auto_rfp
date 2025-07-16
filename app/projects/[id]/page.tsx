import React, { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";
import { ProjectLayout } from "../components/project-layout";
import { ProjectContent } from "../components/project-content";
import { ProjectPageProvider } from "../components/project-page-provider";

// Loading fallback component
function ProjectPageLoading() {
  return (
    <div className="flex flex-col items-center justify-center h-64">
      <Spinner size="lg" className="mb-4" />
      <p>Loading project page...</p>
    </div>
  ); 
}

// Main page component with Suspense boundary
interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;
  
  return (
    <ProjectPageProvider projectId={id}>
      <Suspense fallback={<ProjectPageLoading />}>
        <ProjectLayout>
          <ProjectContent projectId={id} />
        </ProjectLayout>
      </Suspense>
    </ProjectPageProvider>
  );
} 