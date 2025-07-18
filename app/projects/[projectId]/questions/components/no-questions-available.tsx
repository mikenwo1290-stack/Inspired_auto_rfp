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
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-12">
      <div className="text-center max-w-lg px-4">
        <div className="mb-6">
          <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        </div>
        <h3 className="text-2xl font-semibold text-gray-900 mb-3">No Questions Available</h3>
        <p className="text-gray-600 mb-8 leading-relaxed">
          To get started, upload documents for AI to extract questions automatically, or add questions manually.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={handleUploadClick} className="gap-2 px-6 py-2.5">
            <Upload className="h-4 w-4" />
            Upload Documents
          </Button>
          <Button variant="outline" onClick={handleAddManuallyClick} className="gap-2 px-6 py-2.5">
            <Plus className="h-4 w-4" />
            Add Manually
          </Button>
        </div>
      </div>
    </div>
  );
} 