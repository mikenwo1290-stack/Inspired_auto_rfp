'use client';

import React, { useState, useEffect } from "react";
import { SearchBar } from "./SearchBar";
import { ProjectGrid } from "./ProjectGrid";
import { Organization } from "@/types/organization";
import { Project } from "@/types/project";
import { Button } from "@/components/ui/button";
import { PlusIcon, SearchIcon } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { ChevronRight } from "lucide-react";

export function HomeContent() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch organizations
        const orgsResponse = await fetch("/api/organizations");
        if (!orgsResponse.ok) {
          throw new Error("Failed to fetch organizations");
        }
        
        const orgsData = await orgsResponse.json();
        setOrganizations(orgsData);
        if (orgsData.length > 0 && !selectedOrg) {
          setSelectedOrg(orgsData[0].id);
        }
        
        // Fetch projects
        const projectsResponse = await fetch("/api/projects");
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

    fetchData();
  }, [toast, selectedOrg]);

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
              <Button>
                <PlusIcon className="mr-2 h-4 w-4" />
                New project
              </Button>
            </div>
          </div>

          {/* Project Grid */}
          {organizations.length === 0 && !isLoading ? (
            <div className="mt-8 border rounded-lg p-8 text-center">
              <h2 className="text-xl font-medium mb-2">Welcome to AutoRFP</h2>
              <p className="text-gray-600 mb-4">
                Create your first organization to get started
              </p>
              <Button>
                <PlusIcon className="mr-2 h-4 w-4" />
                Create Organization
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {isLoading ? (
                <div className="h-32 rounded-md border border-border animate-pulse bg-muted/20" />
              ) : filteredProjects.length > 0 ? (
                <div className="border rounded-md overflow-hidden">
                  <div className="bg-muted/20 px-4 py-2 border-b text-sm font-medium">
                    zhaoqi@runllama.ai's projects • aws | us-east-2
                  </div>
                  <div className="divide-y">
                    {filteredProjects.map((project) => (
                      <Link href={`/project?projectId=${project.id}`} key={project.id}>
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
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 