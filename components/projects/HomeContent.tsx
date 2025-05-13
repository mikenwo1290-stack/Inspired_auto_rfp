import React, { useState, useEffect } from "react";
import { SearchBar } from "./SearchBar";
import { ProjectGrid } from "./ProjectGrid";
import { Project } from "@/types/project";

export function HomeContent() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch("/api/projects");
        if (response.ok) {
          const data = await response.json();
          setProjects(data);
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Filter projects based on search
  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="w-full p-6">
      <SearchBar 
        searchQuery={searchQuery} 
        onSearchChange={setSearchQuery} 
      />
      
      <div className="mb-8">
        <h2 className="text-xl font-medium mb-4">Your Projects</h2>
        <ProjectGrid 
          projects={filteredProjects} 
          isLoading={isLoading} 
        />
      </div>
    </div>
  );
} 