"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { FileText, Upload, Plus } from "lucide-react"

interface NoQuestionsAvailableProps {
  projectId: string;
}

export function NoQuestionsAvailable({ projectId }: NoQuestionsAvailableProps) {
  
  console.log("In NoQuestionsAvailable, projectId", projectId);

  
  const router = useRouter();

  const handleUploadClick = () => {
    router.push(`/upload?projectId=${projectId}`);
  };

  const handleAddManuallyClick = () => {
    router.push(`/questions/create?projectId=${projectId}`);
  };

  return (
    <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg">
      <div className="text-center max-w-md">
        <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Questions Available</h3>
        <p className="text-gray-500 mb-6">
          To get started, upload documents for AI to extract questions automatically, or add questions manually.
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={handleUploadClick} className="gap-2">
            <Upload className="h-4 w-4" />
            Upload Documents
          </Button>
          <Button variant="outline" onClick={handleAddManuallyClick} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Manually
          </Button>
        </div>
      </div>
    </div>
  );
} 