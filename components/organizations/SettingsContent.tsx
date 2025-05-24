'use client';

import React, { useState, useEffect } from "react";
import { useOrganization } from "@/lib/hooks/use-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LlamaCloudConnection } from "./LlamaCloudConnection";

interface SettingsContentProps {
  orgId: string;
}

export function SettingsContent({ orgId }: SettingsContentProps) {
  const [organization, setOrganization] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState("");
  const [slackWebhook, setSlackWebhook] = useState("");
  const { toast } = useToast();

  const { data: orgData, isLoading: isOrgLoading, isError: isOrgError, mutate } = useOrganization(orgId);
  
  useEffect(() => {
    if (orgData) {
      setOrganization(orgData);
      setName((orgData as any).name || "");
      setSlackWebhook((orgData as any).slackWebhook || "");
      setIsLoading(false);
    } else {
      setIsLoading(isOrgLoading);
    }
    
    if (isOrgError) {
      toast({
        title: "Error",
        description: "Failed to load organization data",
        variant: "destructive",
      });
    }
  }, [orgData, isOrgLoading, isOrgError, toast]);

  // Force refresh of organization data when component mounts to ensure we have latest LlamaCloud data
  useEffect(() => {
    mutate();
  }, [mutate]);

  const handleUpdateOrganization = async (event: React.FormEvent) => {
    event.preventDefault();
    
    try {
      setIsSaving(true);
      
      const response = await fetch(`/api/organizations/${orgId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          slackWebhook,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update organization");
      }
      
      const updatedOrg = await response.json();
      setOrganization(updatedOrg);
      
      toast({
        title: "Success",
        description: "Organization settings updated",
      });
    } catch (error) {
      console.error("Error updating organization:", error);
      toast({
        title: "Error",
        description: "Failed to update organization settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLlamaCloudConnectionUpdate = (updatedOrg: any) => {
    setOrganization(updatedOrg);
  };

  const handleDeleteOrganization = () => {
    // This would typically open a confirmation dialog
    alert("This action would delete the organization. Not implemented in this demo.");
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto">
        <div className="py-6 px-4 sm:px-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-64 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="py-6 px-4 sm:px-6">
        <div className="flex flex-col gap-6">
          <h1 className="text-2xl font-semibold">Organization Settings</h1>
          
          <Tabs defaultValue="general">
            <TabsList>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="integrations">Integrations</TabsTrigger>
              <TabsTrigger value="danger">Danger Zone</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>
                    Manage your organization's basic information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdateOrganization} id="general-form">
                    <div className="grid gap-4 py-2">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Organization Name</Label>
                        <Input
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Enter organization name"
                          required
                        />
                      </div>
                    </div>
                  </form>
                </CardContent>
                <CardFooter>
                  <Button type="submit" form="general-form" disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="integrations" className="mt-4">
              <div className="space-y-6">
                {/* LlamaCloud Integration */}
                <LlamaCloudConnection 
                  orgId={orgId}
                  organization={organization}
                  onConnectionUpdate={handleLlamaCloudConnectionUpdate}
                />

                {/* Slack Integration */}
                <Card>
                  <CardHeader>
                    <CardTitle>Slack Integration</CardTitle>
                    <CardDescription>
                      Receive notifications in Slack when important events happen
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleUpdateOrganization} id="integrations-form">
                      <div className="grid gap-4 py-2">
                        <div className="grid gap-2">
                          <Label htmlFor="slack">Slack Webhook URL</Label>
                          <Input
                            id="slack"
                            value={slackWebhook}
                            onChange={(e) => setSlackWebhook(e.target.value)}
                            placeholder="https://hooks.slack.com/services/..."
                          />
                          <p className="text-xs text-muted-foreground">
                            Get your webhook URL from your Slack workspace settings
                          </p>
                        </div>
                      </div>
                    </form>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" form="integrations-form" disabled={isSaving}>
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="danger" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-destructive">Danger Zone</CardTitle>
                  <CardDescription>
                    Irreversible and destructive actions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Warning</AlertTitle>
                    <AlertDescription>
                      Deleting an organization will permanently remove all projects, documents, and team members. This action cannot be undone.
                    </AlertDescription>
                  </Alert>
                  
                  <Separator className="my-4" />
                  
                  <div className="grid gap-4">
                    <Label htmlFor="confirm">Type the organization name to confirm</Label>
                    <Input
                      id="confirm"
                      placeholder={organization.name}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="destructive" 
                    onClick={handleDeleteOrganization}
                  >
                    Delete Organization
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
} 