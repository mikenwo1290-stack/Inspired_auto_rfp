"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Spinner } from "@/components/ui/spinner";

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Load projects when the component mounts
  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/projects");
        if (response.ok) {
          const data = await response.json();
          setProjects(data);
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
        toast({
          title: "Error",
          description: "Failed to load projects",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      toast({
        title: "Invalid input",
        description: "Project name is required",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newProjectName,
          description: newProjectDescription,
        }),
      });

      if (response.ok) {
        const project = await response.json();
        setShowCreateDialog(false);
        router.push(`/project?projectId=${project.id}`);
      } else {
        throw new Error("Failed to create project");
      }
    } catch (error) {
      console.error("Error creating project:", error);
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8 max-w-5xl mx-auto">
      <div className="w-full">
        <h1 className="text-3xl font-bold mb-2">AutoRFP</h1>
        <p className="text-slate-600 mb-8">Manage your RFP responses efficiently</p>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Your Projects</h2>
          <Button 
            onClick={() => setShowCreateDialog(true)}
          >
            Create New Project
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center my-12">
            <Spinner size="lg" />
          </div>
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <div 
                key={project.id} 
                className="border rounded-lg p-4 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer"
                onClick={() => router.push(`/project?projectId=${project.id}`)}
              >
                <h3 className="font-semibold">{project.name}</h3>
                {project.description && (
                  <p className="text-sm text-slate-600 mt-1">{project.description}</p>
                )}
                <p className="text-xs text-slate-500 mt-2">
                  Created {new Date(project.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center my-12 p-8 border rounded-lg border-dashed">
            <p className="text-slate-500 mb-4">You haven't created any projects yet</p>
            <Button 
              onClick={() => setShowCreateDialog(true)}
            >
              Create Your First Project
            </Button>
          </div>
        )}
      </div>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Project Name
              </label>
              <Input
                id="name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Enter project name"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description (Optional)
              </label>
              <Textarea
                id="description"
                value={newProjectDescription}
                onChange={(e) => setNewProjectDescription(e.target.value)}
                placeholder="Enter project description"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateProject} 
              disabled={isCreating || !newProjectName.trim()}
            >
              {isCreating ? <Spinner size="sm" className="mr-2" /> : null}
              Create Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster />
      </main>
  );
}
