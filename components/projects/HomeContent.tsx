'use client';

import React, { useState, useEffect } from "react";
import { SearchBar } from "./SearchBar";
import { ProjectGrid } from "./ProjectGrid";
import { Organization } from "@/types/organization";
import { Project } from "@/types/project";
import { OrganizationSelector } from "@/components/organizations/OrganizationSelector";
import { CreateOrganizationDialog } from "@/components/organizations/CreateOrganizationDialog";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";

export function HomeContent() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOrgOpen, setIsCreateOrgOpen] = useState(false);
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
        
        // Fetch projects (across all organizations)
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
  }, [toast]);

  // Filter projects based on search
  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="w-full p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-2">
          <OrganizationSelector 
            onCreateNew={() => setIsCreateOrgOpen(true)} 
          />
        </div>
      </div>
      
      <SearchBar 
        searchQuery={searchQuery} 
        onSearchChange={setSearchQuery} 
      />
      
      {organizations.length === 0 && !isLoading ? (
        <div className="mt-8 border rounded-lg p-8 text-center">
          <h2 className="text-xl font-medium mb-2">Welcome to AutoRFP</h2>
          <p className="text-gray-600 mb-4">
            Create your first organization to get started
          </p>
          <Button onClick={() => setIsCreateOrgOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Organization
          </Button>
        </div>
      ) : (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-medium">Your Projects</h2>
            {organizations.length > 0 && (
              <Link href={`/organizations/${organizations[0].slug}`}>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            )}
          </div>
          
          <ProjectGrid 
            projects={filteredProjects} 
            isLoading={isLoading} 
          />
        </div>
      )}
      
      <CreateOrganizationDialog
        isOpen={isCreateOrgOpen}
        onOpenChange={setIsCreateOrgOpen}
        onSuccess={(orgId, orgSlug) => {
          window.location.href = `/organizations/${orgSlug}`;
        }}
      />
    </div>
  );
} 