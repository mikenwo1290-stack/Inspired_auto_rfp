"use client"

import React, { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Download, Send } from "lucide-react"
import { ProjectSwitcher } from "@/components/global/project-switcher"

// Inner component that uses search params
function ProjectHeaderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();   
  const projectId = searchParams.get("projectId");
  const orgId = searchParams.get("orgId");
  
  const handleViewQuestions = (projectId: string) => {
    router.push(`/questions?projectId=${projectId}`);
  };

  return (
    <header className="sticky top-0 z-10 border-b bg-background">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4">
            <ProjectSwitcher 
              currentProjectId={projectId || undefined}
              organizationId={orgId || undefined}
            />
            <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
              Active
            </Badge>
          </div>
          <div className="hidden lg:flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Project ID: {projectId || "Unknown"}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button 
            variant="outline"
            onClick={() => handleViewQuestions(projectId as string)}
          >
            View Questions
          </Button>
        </div>
      </div>
    </header>
  )
}

export function ProjectHeader() {
  return (
    <Suspense fallback={
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="w-96 h-8 animate-pulse bg-muted rounded"></div>
          <div className="flex items-center gap-2">
            <div className="w-24 h-9 animate-pulse bg-muted rounded"></div>
            <div className="w-32 h-9 animate-pulse bg-muted rounded"></div>
          </div>
        </div>
      </header>
    }>
      <ProjectHeaderContent />
    </Suspense>
  )
}
