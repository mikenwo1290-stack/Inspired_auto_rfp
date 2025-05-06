import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LlamaParseResult } from "@/types/api";

interface DocumentViewerProps {
  document: LlamaParseResult;
  onBack: () => void;
}

export function DocumentViewer({ document, onBack }: DocumentViewerProps) {
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