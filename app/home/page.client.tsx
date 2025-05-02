"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUploader } from "@/components/FileUploader";
import { Toaster } from "@/components/ui/toaster";
import { LlamaParseResult } from "@/types/api";

export function HomePage() {
  const [activeTab, setActiveTab] = React.useState<string>("upload");
  const [uploadedFiles, setUploadedFiles] = React.useState<LlamaParseResult[]>([]);
  const [selectedDocument, setSelectedDocument] = React.useState<LlamaParseResult | null>(null);
  const [viewingDocument, setViewingDocument] = React.useState<boolean>(false);

  // Handle file upload completion
  const handleFileProcessed = (result: LlamaParseResult) => {
    console.log("File processed:", result);
    setUploadedFiles(prev => [...prev, result]);
    
    // Automatically select the newly processed document for viewing
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
    <div className="flex flex-col min-h-screen">
      {/* Simple Header */}
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="font-bold text-xl">
              AutoRFP
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="container py-8">
          {viewingDocument && selectedDocument ? (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <Button 
                    variant="outline" 
                    onClick={handleBackToList}
                    className="mb-2"
                  >
                    ← Back to Files
                  </Button>
                  <h1 className="text-3xl font-bold">{selectedDocument.documentName}</h1>
                  <p className="text-muted-foreground">
                    Processed with {selectedDocument.metadata.mode} mode • {selectedDocument.metadata.wordCount} words
                  </p>
                </div>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Document Content</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="whitespace-pre-wrap font-mono text-sm bg-muted p-4 rounded-md max-h-[70vh] overflow-auto">
                    {selectedDocument.content || "No content available for this document."}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Document Upload</h1>
              </div>

              {/* File Upload Component */}
              <div className="mb-8">
                <FileUploader onFileProcessed={handleFileProcessed} />
              </div>

              {/* Simple Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold mb-4">Uploaded Files</h2>
                  <ul className="space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <li 
                        key={index} 
                        className="p-4 border rounded-md bg-muted/30 flex justify-between items-center hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => handleViewDocument(file)}
                      >
                        <div>
                          <p className="font-medium">{file.documentName}</p>
                          <p className="text-sm text-muted-foreground">
                            Processed with {file.metadata.mode} mode • {file.metadata.wordCount} words
                          </p>
                        </div>
                        <Button variant="secondary" size="sm">View Content</Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      <footer className="border-t py-6">
        <div className="container flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © 2023 AutoRFP. All rights reserved.
          </p>
        </div>
      </footer>
      
      <Toaster />
    </div>
  );
} 