"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Plus, Users, FolderOpen, Settings, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";

interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  aiProcessingEnabled: boolean;
  autoApprovalThreshold: number;
  createdAt: string;
  updatedAt: string;
  organizationUsers: Array<{
    id: string;
    role: string;
    user: {
      id: string;
      email: string;
      name?: string;
    };
  }>;
  projects: Array<{
    id: string;
    name: string;
    description?: string;
    createdAt: string;
  }>;
  _count: {
    projects: number;
    organizationUsers: number;
  };
}

interface CreateOrganizationData {
  name: string;
  description: string;
}

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);

  const [formData, setFormData] = useState<CreateOrganizationData>({
    name: "",
    description: "",
  });

  const fetchOrganizations = async () => {
    try {
      const response = await fetch("/api/organizations");
      const data = await response.json();
      
      if (data.success) {
        setOrganizations(data.data);
      } else {
        toast.error(data.error || "Failed to fetch organizations");
      }
    } catch (error) {
      toast.error("Failed to fetch organizations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const handleCreateOrganization = async () => {
    try {
      const response = await fetch("/api/organizations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Organization created successfully");
        setCreateDialogOpen(false);
        setFormData({
          name: "",
          description: "",
        });
        fetchOrganizations();
      } else {
        toast.error(data.error || "Failed to create organization");
      }
    } catch (error) {
      toast.error("Failed to create organization");
    }
  };

  const handleUpdateOrganization = async () => {
    if (!editingOrg) return;

    try {
      const response = await fetch(`/api/organizations/${editingOrg.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Organization updated successfully");
        setEditingOrg(null);
        fetchOrganizations();
      } else {
        toast.error(data.error || "Failed to update organization");
      }
    } catch (error) {
      toast.error("Failed to update organization");
    }
  };

  const handleDeleteOrganization = async (org: Organization) => {
    if (!confirm("Are you sure you want to delete this organization?")) return;

    try {
      const response = await fetch(`/api/organizations/${org.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Organization deleted successfully");
        fetchOrganizations();
      } else {
        toast.error(data.error || "Failed to delete organization");
      }
    } catch (error) {
      toast.error("Failed to delete organization");
    }
  };

  const openEditDialog = (org: Organization) => {
    setEditingOrg(org);
    setFormData({
      name: org.name,
      description: org.description || "",
    });
  };

  const generateSlugFromName = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto">
        <div className="py-6 px-4 sm:px-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">Organizations</h1>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="py-6 px-4 sm:px-6 pt-20">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Organizations</h1>
              <p className="text-muted-foreground">
                Manage organizations and their settings
              </p>
            </div>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Organization
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create New Organization</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Organization Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          name: e.target.value
                        }));
                      }}
                      placeholder="My Organization"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Organization description..."
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setCreateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleCreateOrganization}>
                      Create Organization
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {organizations.length === 0 ? (
            <Card className="text-center p-8">
              <CardContent className="space-y-4">
                <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-semibold">No organizations yet</h3>
                  <p className="text-muted-foreground">
                    Create your first organization to get started
                  </p>
                </div>
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Organization
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {organizations.map((org) => (
                <Card key={org.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{org.name}</CardTitle>
                        <CardDescription>@{org.slug}</CardDescription>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(org)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteOrganization(org)}
                          disabled={org._count.projects > 0 || org._count.organizationUsers > 0}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {org.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {org.description}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">
                        <Users className="mr-1 h-3 w-3" />
                        {org._count.organizationUsers} users
                      </Badge>
                      <Badge variant="secondary">
                        <FolderOpen className="mr-1 h-3 w-3" />
                        {org._count.projects} projects
                      </Badge>
                    </div>

                    <div className="pt-2">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => window.location.href = `/organizations/${org.id}`}
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Visit Organization
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Edit Dialog */}
          <Dialog open={!!editingOrg} onOpenChange={() => setEditingOrg(null)}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Edit Organization</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Organization Name</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="My Organization"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Organization description..."
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setEditingOrg(null)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateOrganization}>
                    Update Organization
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
} 