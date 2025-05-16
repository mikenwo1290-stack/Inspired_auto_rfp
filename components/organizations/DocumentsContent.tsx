'use client';

import React from "react";
import { Button } from "@/components/ui/button";
import { FileIcon, FolderIcon, UploadIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface DocumentsContentProps {
  orgId: string;
}

export function DocumentsContent({ orgId }: DocumentsContentProps) {
  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="py-6 px-4 sm:px-6">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <h1 className="text-2xl font-semibold">Organization Documents</h1>
            <Button>
              <UploadIcon className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
          </div>

          {/* Documents placeholder */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <FileIcon className="h-4 w-4 mr-2" />
                  Document Library
                </CardTitle>
                <CardDescription>
                  Shared organization documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  This page is under construction. Documents will be available soon.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">View Library</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <FolderIcon className="h-4 w-4 mr-2" />
                  RFP Templates
                </CardTitle>
                <CardDescription>
                  Standard templates for RFPs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Access standardized templates for different types of RFPs.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">Browse Templates</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 