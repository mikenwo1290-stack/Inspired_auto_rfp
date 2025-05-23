'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronDown, Check, Plus, FolderOpen, Search } from 'lucide-react';
import { CreateProjectDialog } from '@/components/projects/CreateProjectDialog';

interface Project {
  id: string;
  name: string;
  description?: string;
  organizationId: string;
}

interface ProjectSwitcherProps {
  currentProjectId?: string;
  organizationId?: string;
}

export function ProjectSwitcher({ currentProjectId, organizationId }: ProjectSwitcherProps) {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        const url = organizationId 
          ? `/api/projects?organizationId=${organizationId}`
          : '/api/projects';
          
        const response = await fetch(url);
        if (response.ok) {
          const projectsData = await response.json();
          setProjects(projectsData);
          
          // Find current project
          if (currentProjectId) {
            const current = projectsData.find((p: Project) => p.id === currentProjectId);
            setCurrentProject(current || null);
          }
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [currentProjectId, organizationId]);

  const handleProjectSelect = (projectId: string) => {
    const orgParam = organizationId ? `&orgId=${organizationId}` : '';
    router.push(`/project?projectId=${projectId}${orgParam}`);
    setIsOpen(false);
  };

  const handleCreateProject = (projectId: string) => {
    const orgParam = organizationId ? `&orgId=${organizationId}` : '';
    router.push(`/project?projectId=${projectId}${orgParam}`);
    
    // Update local state to include the new project and set it as current
    // The useEffect will refetch projects when the component mounts with new projectId
    setCurrentProject(null); // Clear current to show loading state
  };

  // Filter projects based on search query
  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Reset search when dropdown closes
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setSearchQuery('');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-6 w-48 animate-pulse bg-muted rounded"></div>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="flex items-center gap-2 text-left font-normal hover:bg-muted/50"
          >
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
            <span className="max-w-[200px] truncate">
              {currentProject?.name || 'Select a project'}
            </span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[280px]">
          {/* Search Input */}
          <div className="p-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Find project..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          
          <DropdownMenuSeparator />
          
          {/* Current Project Section */}
          {currentProject && (
            <>
              <DropdownMenuLabel className="font-normal text-muted-foreground">
                Current project
              </DropdownMenuLabel>
              <DropdownMenuItem className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-medium">{currentProject.name}</span>
                  {currentProject.description && (
                    <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                      {currentProject.description}
                    </span>
                  )}
                </div>
                <Check className="h-4 w-4 text-primary" />
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          
          {/* Projects List */}
          {filteredProjects.length > 0 ? (
            <>
              {!currentProject && (
                <DropdownMenuLabel className="font-normal text-muted-foreground">
                  Switch project
                </DropdownMenuLabel>
              )}
              {filteredProjects
                .filter(project => project.id !== currentProjectId)
                .map((project) => (
                  <DropdownMenuItem
                    key={project.id}
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => handleProjectSelect(project.id)}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{project.name}</span>
                      {project.description && (
                        <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                          {project.description}
                        </span>
                      )}
                    </div>
                  </DropdownMenuItem>
                ))
              }
            </>
          ) : searchQuery ? (
            <DropdownMenuItem disabled>
              <span className="text-muted-foreground">No projects found matching "{searchQuery}"</span>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem disabled>
              <span className="text-muted-foreground">No projects found</span>
            </DropdownMenuItem>
          )}
          
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="flex items-center gap-2 cursor-pointer text-primary"
            onClick={() => {
              setIsCreateDialogOpen(true);
              setIsOpen(false);
            }}
          >
            <Plus className="h-4 w-4" />
            <span>New project</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {organizationId && (
        <CreateProjectDialog
          isOpen={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          organizationId={organizationId}
          onSuccess={handleCreateProject}
        />
      )}
    </>
  );
} 