'use client';

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function NewOrganizationPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Organization name is required",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const response = await fetch('/api/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description: description.trim() || null,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to create organization");
      }
      
      const organization = await response.json();
      
      toast({
        title: "Success",
        description: "Organization created successfully",
      });
      
      // Redirect to the new organization
      router.push(`/org/${organization.id}`);
    } catch (error) {
      console.error("Error creating organization:", error);
      toast({
        title: "Error",
        description: "Failed to create organization",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-md py-10 px-4">
      <Button 
        variant="ghost" 
        onClick={() => router.push('/')}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to organizations
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle>Create a new organization</CardTitle>
          <CardDescription>
            Create a new organization to manage your projects and team
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Organization name</Label>
                <Input
                  id="name"
                  placeholder="Enter organization name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2 mb-4">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Enter organization description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create organization"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
} 