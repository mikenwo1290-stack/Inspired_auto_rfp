"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FileUploader } from "@/components/FileUploader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Toaster } from "@/components/ui/toaster";
import { LlamaParseResult } from "@/types/api";

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
    <div className="flex flex-col min-h-screen">
      <header className="border-b bg-white">
        <div className="container flex h-16 p-4 items-center">
          <Link href="/" className="font-bold text-xl">
            AutoRFP
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 bg-slate-50">
        <div className="flex h-full">
          {/* Left sidebar */}
          <div className="w-[60px] border-r bg-white flex flex-col items-center py-4 space-y-4">
            <div className="w-8 h-8 bg-primary/10 text-primary rounded-md flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <div className="w-8 h-8 bg-slate-100 rounded-md flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="3" y1="9" x2="21" y2="9"></line>
                <line x1="9" y1="21" x2="9" y2="9"></line>
              </svg>
            </div>
            <div className="w-8 h-8 bg-slate-100 rounded-md flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
              </svg>
            </div>
          </div>

          {/* Main content area */}
          <div className="flex-1 p-8">
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
                  <CardContent className="p-6">
                    <div className="whitespace-pre-wrap font-mono text-sm bg-muted p-4 rounded-md max-h-[70vh] overflow-auto">
                      {selectedDocument.content || "No content available for this document."}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div>
                <div className="mb-8">
                  <p className="text-sm text-muted-foreground">Software Development RFP for Velocity Labs</p>
                  <h1 className="text-2xl font-semibold mt-1">Sections</h1>
                </div>
                
                <div className="mb-8">
                  <p className="text-slate-500 mb-2">Welcome to AutoRFP</p>
                  <h2 className="text-xl font-semibold mb-6">Get started by adding sections to the project.</h2>
                  
                  <div className="grid grid-cols-2 gap-8">
                    {/* Left upload option - this maintains our existing functionality */}
                    <div className="col-span-1">
                      <div className="mb-8">
                        <FileUploader onFileProcessed={handleFileProcessed} />
                      </div>
                    </div>
                    
                    {/* Right manual option - simplified placeholder similar to screenshot */}
                    <div className="col-span-1">
                      <Card className="border-2 border-dashed border-slate-200 bg-white">
                        <CardContent className="p-6 flex flex-col items-center justify-center min-h-[300px] text-center">
                          <div className="mb-4 p-4 bg-slate-100 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                              <line x1="12" y1="8" x2="12" y2="16"></line>
                              <line x1="8" y1="12" x2="16" y2="12"></line>
                            </svg>
                          </div>
                          <h3 className="text-lg font-semibold mb-2">Add new sections manually or from templates</h3>
                          <p className="text-sm text-slate-500 mb-4">Create custom sections or use pre-built templates</p>
                          <Button variant="outline">Add sections</Button>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
                
                {/* Uploaded files list */}
                {uploadedFiles.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">Uploaded Files</h2>
                    <ul className="space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <li 
                          key={index} 
                          className="p-4 border rounded-md bg-white flex justify-between items-center hover:bg-slate-50 cursor-pointer transition-colors"
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
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Toaster />
    </div>
  );
} 