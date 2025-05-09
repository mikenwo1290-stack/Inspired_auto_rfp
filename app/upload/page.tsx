"use client"


// Create a separate component that uses useSearchParams

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { PageLayout } from "@/components/upload/PageLayout";
import { UploadComponent } from "@/components/upload/UploadComponent";


function UploadPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const projectId = searchParams.get("projectId");
    
    const [project, setProject] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
  
    // Load project data
    useEffect(() => {
      if (!projectId) {
        setError("No project ID provided. Please create or select a project first.");
        setIsLoading(false);
        return;
      }
  
      const fetchProject = async () => {
        try {
          const response = await fetch(`/api/projects/${projectId}`);
          
          if (!response.ok) {
            throw new Error("Failed to load project");
          }
          
          const data = await response.json();
          setProject(data);
          
          // TODO: In a real implementation, we would fetch the project's
          // existing documents here and populate uploadedFiles
          
        } catch (error) {
          console.error("Error loading project:", error);
          setError("Failed to load project. Please try again.");
        } finally {
          setIsLoading(false);
        }
      };
  
      fetchProject();
    }, [projectId]);
  
    // Handle view questions button click
    const handleViewQuestions = (projectId: string) => {
      router.push(`/questions?projectId=${projectId}`);
    };
  
    if (isLoading) {
      return (
        <PageLayout>
          <div className="flex flex-col items-center justify-center h-64">
            <Spinner size="lg" className="mb-4" />
            <p>Loading project...</p>
          </div>
        </PageLayout>
      );
    }
  
    if (error) {
      return (
        <PageLayout>
          <div className="flex flex-col items-center justify-center h-64">
            <div className="text-red-500 mb-4">{error}</div>
            <Button onClick={() => router.push("/")}>
              Back to Projects
            </Button>
          </div>
        </PageLayout>
      );
    }
  
    return (
      <PageLayout>
        {project && (
          <div className="mb-6">
            <h1 className="text-2xl font-semibold">{project.name}</h1>
            {project.description && (
              <p className="text-slate-600 mt-1">{project.description}</p>
            )}
            <div className="mt-4">
              <Button 
                variant="outline"
                onClick={() => handleViewQuestions(projectId as string)}
              >
                View Questions
              </Button>
            </div>
          </div>
        )}
  
        <UploadComponent projectId={projectId} />
      </PageLayout>
    );
  }
  
  export default UploadPage;