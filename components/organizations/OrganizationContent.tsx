'use client';

import React, { useState, useEffect } from "react";
import { Organization } from "@/types/organization";
import { Project } from "@/types/project";
import { Button } from "@/components/ui/button";
import { PlusIcon, SearchIcon, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

interface OrganizationContentProps {
  orgId: string;
}

export function OrganizationContent({ orgId }: OrganizationContentProps) {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch organization details
        const orgResponse = await fetch(`/api/organizations/${orgId}`);
        if (!orgResponse.ok) {
          throw new Error("Failed to fetch organization");
        }
        
        const orgData = await orgResponse.json();
        setOrganization(orgData);
        
        // Fetch organization projects
        const projectsResponse = await fetch(`/api/projects?organizationId=${orgId}`);
        if (projectsResponse.ok) {
          const projectsData = await projectsResponse.json();
          setProjects(projectsData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (orgId) {
      fetchData();
    }
  }, [orgId, toast]);

  // Filter projects based on search
  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="py-6 px-4 sm:px-6">
        <div className="flex flex-col gap-6">
          {/* Header & Search */}
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <h1 className="text-2xl font-semibold">Projects</h1>
            <div className="flex gap-2">
              <div className="relative flex-1 md:w-64">
                <Input
                  type="text"
                  placeholder="Search for a project"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9"
                />
                <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
              <Button onClick={() => router.push(`/org/${orgId}/new-project`)}>
                <PlusIcon className="mr-2 h-4 w-4" />
                New project
              </Button>
            </div>
          </div>

          {/* Projects List */}
          <div className="grid grid-cols-1 gap-4">
            {isLoading ? (
              <div className="h-32 rounded-md border border-border animate-pulse bg-muted/20" />
            ) : filteredProjects.length > 0 ? (
              <div className="border rounded-md overflow-hidden">
                <div className="bg-muted/20 px-4 py-2 border-b text-sm font-medium">
                  {organization?.name || 'Organization'} • aws | us-east-2
                </div>
                <div className="divide-y">
                  {filteredProjects.map((project) => (
                    <Link href={`/project?projectId=${project.id}&orgId=${orgId}`} key={project.id}>
                      <div className="p-4 hover:bg-muted/10 transition-colors flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{project.name}</h3>
                          <p className="text-sm text-muted-foreground">{project.description || 'No description'}</p>
                        </div>
                        <Button variant="ghost" size="sm" className="text-muted-foreground">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center p-8 border rounded-md">
                <p className="text-muted-foreground">No projects found</p>
                <Button 
                  className="mt-4"
                  onClick={() => router.push(`/org/${orgId}/new-project`)}
                >
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Create your first project
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 