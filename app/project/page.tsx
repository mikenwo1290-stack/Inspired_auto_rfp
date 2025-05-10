"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { SidebarProvider } from "@/components/ui/sidebar"
import { ProjectLayout } from "./components/project-layout";
import { ProjectContent } from "./components/project-content";




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
export default function ProjectPage() {
  // Control sidebar state at this level to avoid re-renders causing toggle issues
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  return (
    <SidebarProvider 
      defaultOpen={true}
      open={sidebarOpen}
      onOpenChange={setSidebarOpen}
    >
      <Suspense fallback={<ProjectPageLoading />}>
        <ProjectLayout>
          <ProjectContent />
        </ProjectLayout>
      </Suspense>
    </SidebarProvider>
  );
} 