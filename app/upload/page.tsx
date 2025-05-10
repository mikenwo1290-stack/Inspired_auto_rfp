"use client"


// Create a separate component that uses useSearchParams

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
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
        
          <div className="flex flex-col items-center justify-center h-64">
            <Spinner size="lg" className="mb-4" />
            <p>Loading project...</p>
          </div>
        
      );
    }
  
    if (error) {
      return (
        
          <div className="flex flex-col items-center justify-center h-64">
            <div className="text-red-500 mb-4">{error}</div>
            <Button onClick={() => router.push("/")}>
              Back to Projects
            </Button>
          </div>
        
      );
    }
  
    return (
      <div>

        <UploadComponent projectId={projectId} />
        </div>
    );
  }
  
  export default UploadPage;