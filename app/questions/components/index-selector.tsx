"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertCircle, Database, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProjectIndex {
  id: string;
  name: string;
}

interface IndexSelectorProps {
  availableIndexes: ProjectIndex[];
  selectedIndexes: Set<string>;
  organizationConnected: boolean;
  onIndexToggle: (indexId: string) => void;
  onSelectAllIndexes: () => void;
}

export function IndexSelector({
  availableIndexes,
  selectedIndexes,
  organizationConnected,
  onIndexToggle,
  onSelectAllIndexes
}: IndexSelectorProps) {
  const [showIndexSelector, setShowIndexSelector] = useState(false);

  if (!organizationConnected) {
    return (
      <Card className="mb-6 border-amber-200 bg-amber-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <div>
              <p className="font-medium text-amber-800">No Document Indexes Available</p>
              <p className="text-sm text-amber-700">
                Connect your organization to LlamaCloud and select document indexes in the project settings to enable AI-powered answer generation.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (availableIndexes.length === 0) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">
              {availableIndexes.length === 1 
                ? availableIndexes[0].name
                : `${availableIndexes.length} Document Indexes`
              }
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              {selectedIndexes.size} of {availableIndexes.length} selected
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowIndexSelector(!showIndexSelector)}
          >
            <Settings className="h-4 w-4 mr-1" />
            {showIndexSelector ? 'Hide' : 'Configure'}
          </Button>
        </div>
        {selectedIndexes.size === 0 && (
          <p className="text-sm text-amber-600 mt-2">
            ⚠️ No indexes selected. AI generation will use default responses.
          </p>
        )}
      </CardHeader>
      

    </Card>
  );
} 