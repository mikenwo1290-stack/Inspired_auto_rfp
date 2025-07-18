import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LlamaParseResult } from "@/types/api";
import { Spinner } from "@/components/ui/spinner";
import { useRouter } from "next/navigation";
import { ProcessingStatus } from "@/components/ProcessingModal";

interface DocumentViewerProps {
  document: LlamaParseResult;
  onBack: () => void;
  updateProcessingStatus?: (status: ProcessingStatus) => void;
}

export function DocumentViewer({ document, onBack, updateProcessingStatus }: DocumentViewerProps) {
  const router = useRouter();
  const [isExtracting, setIsExtracting] = useState(false);
  
  // Function to extract questions from the document
  const handleExtractQuestions = async () => {
    setIsExtracting(true);
    
    // Update the processing status to "extracting" if available
    if (updateProcessingStatus) {
      updateProcessingStatus("extracting");
    }
    
    try {
      const response = await fetch('/api/extract-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId: document.documentId,
          documentName: document.documentName,
          content: document.content,
          projectId: document.projectId,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to extract questions');
      }
      
      const result = await response.json();
      
      // Update to complete status when done
      if (updateProcessingStatus) {
        updateProcessingStatus("complete");
        
        // Let the UI show "complete" for a moment before navigating
        setTimeout(() => {
          // Navigate to questions page with the project ID
          router.push(`/questions?projectId=${document.projectId || document.documentId}`);
        }, 1000);
      } else {
        // If no status updater provided, navigate immediately
        router.push(`/questions?projectId=${document.projectId || document.documentId}`);
      }
    } catch (error) {
      console.error('Error extracting questions:', error);
      // We could add toast notification here
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <Button 
            variant="outline" 
            onClick={onBack}
            className="mb-2"
          >
            ← Back to Files
          </Button>
          <h1 className="text-3xl font-bold">{document.documentName}</h1>
          <p className="text-muted-foreground">
            Processed with {document.metadata.mode} mode • {document.metadata.wordCount} words
          </p>
        </div>
        <Button 
          onClick={handleExtractQuestions}
          disabled={isExtracting}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isExtracting ? (
            <>
              <Spinner className="mr-2" size="sm" />
              Extracting Questions...
            </>
          ) : (
            'Get Questions'
          )}
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <div className="whitespace-pre-wrap font-mono text-sm bg-muted p-4 rounded-md max-h-[70vh] overflow-auto">
            {document.content || "No content available for this document."}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 