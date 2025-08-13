'use client';

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";
import { Project } from "@/types/project";
import Link from "next/link";
import { MoreVertical, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { useOrganization } from "@/context/organization-context";

interface ProjectCardProps {
  project: Project;
  onProjectDeleted?: () => void;
}

export function ProjectCard({ project, onProjectDeleted }: ProjectCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { refreshData } = useOrganization();
  
  const status = project.status ?? "In Progress"; // Default status

  const handleDeleteProject = async () => {
    try {
      setIsDeleting(true);
      
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete project');
      }

      toast({
        title: 'Success',
        description: `Project "${project.name}" has been deleted successfully.`,
      });

      setShowDeleteDialog(false);
      
      // Refresh the organization context to update the switcher
      await refreshData();
      
      // Call the callback to refresh the project list
      if (onProjectDeleted) {
        onProjectDeleted();
      }
      
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete project',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <>
      <div className="relative h-full group">
        <Link href={`/projects/${project.id}`} className="block h-full">
          <Card className="hover:shadow-lg hover:bg-accent/50 transition-all duration-200 cursor-pointer flex flex-col h-full min-h-[180px]">
            <CardHeader className="pb-2 flex-shrink-0">
              <div className="flex items-start justify-between">
                              <div className="flex-1">
                <CardTitle className="text-lg line-clamp-2">{project.name}</CardTitle>
                <CardDescription className="mt-1 line-clamp-3 min-h-[60px]">
                  {project.summary 
                    ? (project.summary.length > 100 
                        ? `${project.summary.substring(0, 100)}...` 
                        : project.summary)
                    : (project.description || 'No description available')
                  }
                </CardDescription>
              </div>
                <div className="flex items-center gap-2 ml-2">
                  <Badge variant={status === "Completed" ? "default" : "secondary"} className="flex-shrink-0">
                    {status}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={handleMenuClick}>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          router.push(`/projects/${project.id}`);
                        }}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowDeleteDialog(true);
                        }}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-end">
              <p className="text-sm text-muted-foreground">
                Created {new Date(project.createdAt).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDeleteProject}
        title="Delete Project"
        description="This will permanently delete the project and all its associated data."
        itemName={project.name}
        isLoading={isDeleting}
      />
    </>
  );
}