import React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";

export function CreateProjectCard() {
  return (
    <Link href="/projects" className="block">
      <Card className="hover:shadow-md transition-shadow border-dashed flex items-center justify-center h-full">
        <CardContent className="p-6 text-center flex items-center justify-center w-full">
          <div className="flex items-center justify-center">
            <Plus className="h-8 w-8 mr-3 text-muted-foreground" />
            <p className="text-muted-foreground">Create New Project</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
} 