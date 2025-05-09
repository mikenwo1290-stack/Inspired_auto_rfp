import React from "react";
import { FileUploader } from "@/components/FileUploader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LlamaParseResult } from "@/types/api";
import { ProcessingStatus } from "@/components/ProcessingModal";

interface UploadSectionProps {
  onFileProcessed: (result: LlamaParseResult) => void;
  processingStatus?: ProcessingStatus;
  updateProcessingStatus?: (status: ProcessingStatus) => void;
}

export function UploadSection({ 
  onFileProcessed, 
  processingStatus, 
  updateProcessingStatus 
}: UploadSectionProps) {
  return (
    <div>
      <div className="mb-8">
        <p className="text-slate-500 mb-2">Welcome to AutoRFP</p>
        <h2 className="text-xl font-semibold mb-6">Get started by adding sections to the project.</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
          {/* Left upload option */}
          <div className="col-span-1">
            <div className="mb-8">
              <FileUploader 
                onFileProcessed={onFileProcessed}
                processingStatus={processingStatus}
                updateProcessingStatus={updateProcessingStatus}
              />
            </div>
          </div>
          
          {/* Right manual option */}
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
    </div>
  );
} 