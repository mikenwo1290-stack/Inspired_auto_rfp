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
          

        </div>
      </div>
    </div>
  );
} 