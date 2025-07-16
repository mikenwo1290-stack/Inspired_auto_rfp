'use client';

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileIcon, FolderIcon, UploadIcon, Cloud, Settings } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { LlamaCloudDocuments } from "./LlamaCloudDocuments";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";

interface DocumentsContentProps {
  id: string;
}

export function DocumentsContent({  id }: DocumentsContentProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const { toast } = useToast();

  const checkConnection = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/llamacloud/documents?organizationId=${id}`);
      
      if (response.ok) {
        setIsConnected(true);
      } else {
        const error = await response.json();
        if (error.error?.includes('not connected')) {
          setIsConnected(false);
        }
      }
    } catch (error) {
      console.error('Error checking LlamaCloud connection:', error);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const checkUserRole = async () => {
    try {

      console.log("checkUserRole debugging 123456 ", id)
      const response = await fetch(`/api/organizations/${id}/user-role`);
      
      if (response.ok) {
        const data = await response.json();
        setUserRole(data.role);
      } else {
        console.error('Error checking user role:', await response.text());
        setUserRole(null);
      }
    } catch (error) {
      console.error('Error checking user role:', error);
      setUserRole(null);
    }
  };

  useEffect(() => {
    checkConnection();
    checkUserRole();
  }, [id]);

  const canManageConnections = userRole === 'owner' || userRole === 'admin';

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

          {/* LlamaCloud Section */}
          <div className="space-y-4">
            {isLoading ? (
              <Card>
                <CardContent className="py-6">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                    <span className="ml-2 text-sm text-muted-foreground">Checking connection...</span>
                  </div>
                </CardContent>
              </Card>
            ) : !isConnected ? (
              <Alert>
                <Cloud className="h-4 w-4" />
                <AlertTitle>LlamaCloud Not Connected</AlertTitle>
                <AlertDescription className="space-y-2">
                  <p>Connect your organization to a LlamaCloud project to access documents and pipelines.</p>
                  {canManageConnections ? (
                    <Link href={`/organizations/${id}/settings`}>
                      <Button variant="outline" size="sm" className="mt-2">
                        <Settings className="mr-2 h-4 w-4" />
                        Go to Organization Settings
                      </Button>
                    </Link>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-2">
                      Contact your organization owner or admin to set up the LlamaCloud connection.
                    </p>
                  )}
                </AlertDescription>
              </Alert>
            ) : (
              <LlamaCloudDocuments 
                organizationId={id} 
                onDisconnect={() => setIsConnected(false)}
              />
            )}
          </div>

        </div>
      </div>
    </div>
  );
} 