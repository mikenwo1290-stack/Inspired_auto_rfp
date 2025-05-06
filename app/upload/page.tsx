"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/components/ui/use-toast";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { LlamaParseResult } from "@/types/api";
import { PageLayout } from "@/components/upload/PageLayout";
import { DocumentViewer } from "@/components/upload/DocumentViewer";
import { FileList } from "@/components/upload/FileList";
import { UploadSection } from "@/components/upload/UploadSection";
import { ProcessingStatus } from "@/components/ProcessingModal";

// Create a separate component that uses useSearchParams
function UploadPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");
  
  const [project, setProject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<LlamaParseResult[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<LlamaParseResult | null>(null);
  const [viewingDocument, setViewingDocument] = useState<boolean>(false);
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>("uploading");

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

  // Handle file upload completion
  const handleFileProcessed = async (result: LlamaParseResult) => {
    console.log("File processed:", result);

    // Add project ID to the result object for reference
    const resultWithProject: LlamaParseResult = {
      ...result,
      projectId: projectId || undefined
    };

    try {
      // Update status to parsing when starting OpenAI processing
      setProcessingStatus("parsing");
      console.log("Starting OpenAI extraction process");
      
      // Store the questions in the database
      const extractResponse = await fetch('/api/extract-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId: result.documentId,
          documentName: result.documentName,
          content: result.content,
          projectId, // Add the project ID to link questions to this project
        }),
      });

      if (!extractResponse.ok) {
        throw new Error('Failed to extract questions');
      }

      // Update status to extracting when OpenAI is processing
      setProcessingStatus("extracting");
      
      // Get the response data
      const extractedData = await extractResponse.json();
      console.log("Questions extracted successfully:", extractedData);
      
      // Mark as complete
      setProcessingStatus("complete");

      // Add to uploaded files
      setUploadedFiles(prev => [...prev, resultWithProject]);
      
      // Wait a moment to show completion state before redirecting
      setTimeout(() => {
        // Redirect to questions page
        router.push(`/questions?projectId=${projectId}`);
      }, 1000);
    } catch (error) {
      console.error('Error processing document:', error);
      toast({
        title: 'Error',
        description: 'Failed to process document',
        variant: 'destructive',
      });
    }
  };

  // Update processing status from child components
  const updateProcessingStatus = (status: ProcessingStatus) => {
    setProcessingStatus(status);
  };

  // Handle document selection for viewing
  const handleViewDocument = (doc: LlamaParseResult) => {
    setSelectedDocument(doc);
    setViewingDocument(true);
  };

  // Handle back button click to return to file list
  const handleBackToList = () => {
    setViewingDocument(false);
  };

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

      {viewingDocument && selectedDocument ? (
        <DocumentViewer 
          document={selectedDocument} 
          onBack={handleBackToList}
          updateProcessingStatus={updateProcessingStatus}
        />
      ) : (
        <>
          <UploadSection 
            onFileProcessed={handleFileProcessed}
            processingStatus={processingStatus}
            updateProcessingStatus={updateProcessingStatus}
          />
          <FileList files={uploadedFiles} onViewDocument={handleViewDocument} />
        </>
      )}
      
      <Toaster />
    </PageLayout>
  );
}

// Loading fallback component
function UploadPageLoading() {
  return (
    <PageLayout>
      <div className="flex flex-col items-center justify-center h-64">
        <Spinner size="lg" className="mb-4" />
        <p>Loading upload page...</p>
      </div>
    </PageLayout>
  );
}

// Main page component with Suspense boundary
export default function UploadPage() {
  return (
    <Suspense fallback={<UploadPageLoading />}>
      <UploadPageContent />
    </Suspense>
  );
} 