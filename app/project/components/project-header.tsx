"use client"

import React, { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Download, Send } from "lucide-react"

// Inner component that uses search params
function ProjectHeaderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();   
  const projectId = searchParams.get("projectId");
  const [projectName, setProjectName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    if (projectId) {
      const fetchProjectDetails = async () => {
        try {
          const response = await fetch(`/api/projects/${projectId}`);
          if (response.ok) {
            const projectData = await response.json();
            setProjectName(projectData.name);
          }
        } catch (error) {
          console.error("Error fetching project details:", error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchProjectDetails();
    }
  }, [projectId]);
  
  const handleViewQuestions = (projectId: string) => {
    router.push(`/questions?projectId=${projectId}`);
  };

  return (
    <header className="sticky top-0 z-10 border-b bg-background">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl font-semibold">
              {loading ? (
                <div className="h-7 w-64 animate-pulse bg-muted rounded"></div>
              ) : (
                projectName || "Unnamed Project"
              )}
            </h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Project ID: {projectId || "Unknown"}</span>
              </div>
            </div>
          </div>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
            Active
          </Badge>
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
