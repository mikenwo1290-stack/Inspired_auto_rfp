"use client";

import React, { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { LlamaParseResult } from "@/types/api";
import { PageLayout } from "@/components/upload/PageLayout";
import { DocumentViewer } from "@/components/upload/DocumentViewer";
import { FileList } from "@/components/upload/FileList";
import { UploadSection } from "@/components/upload/UploadSection";

export default function UploadPage() {
  const [uploadedFiles, setUploadedFiles] = useState<LlamaParseResult[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<LlamaParseResult | null>(null);
  const [viewingDocument, setViewingDocument] = useState<boolean>(false);

  // Handle file upload completion
  const handleFileProcessed = (result: LlamaParseResult) => {
    console.log("File processed:", result);
    setUploadedFiles(prev => [...prev, result]);
    setSelectedDocument(result);
    setViewingDocument(true);
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

  return (
    <PageLayout>
      {viewingDocument && selectedDocument ? (
        <DocumentViewer 
          document={selectedDocument} 
          onBack={handleBackToList} 
        />
      ) : (
        <>
          <UploadSection onFileProcessed={handleFileProcessed} />
          <FileList files={uploadedFiles} onViewDocument={handleViewDocument} />
        </>
      )}
      
      <Toaster />
    </PageLayout>
  );
} 