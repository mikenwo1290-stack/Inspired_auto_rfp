'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  AlertCircle, 
  CheckCircle2, 
  Cloud, 
  Loader2, 
  ExternalLink,
  Unlink
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface LlamaCloudProject {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
  organization_id?: string;
  organization_name?: string;
}

interface LlamaCloudConnectionProps {
  orgId: string;
  organization: any;
  onConnectionUpdate: (updatedOrg: any) => void;
}

export function LlamaCloudConnection({ orgId, organization, onConnectionUpdate }: LlamaCloudConnectionProps) {
  const [apiKey, setApiKey] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [availableProjects, setAvailableProjects] = useState<LlamaCloudProject[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isFetchingProjects, setIsFetchingProjects] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = React.useRef<NodeJS.Timeout | undefined>(undefined);
  const { toast } = useToast();

  const isConnected = organization?.llamaCloudConnectedAt;
  const connectedProjectName = organization?.llamaCloudProjectName;
  const connectedProjectId = organization?.llamaCloudProjectId;

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Fetch available projects when API key is entered
  const fetchProjects = async (key: string) => {
    if (!key.trim()) {
      setAvailableProjects([]);
      return;
    }

    setIsFetchingProjects(true);
    setError(null);

    try {
      // First validate the API key and fetch projects
      const [projectsResponse, organizationsResponse] = await Promise.all([
        fetch('https://api.cloud.llamaindex.ai/api/v1/projects', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json',
          },
        }),
        fetch('https://api.cloud.llamaindex.ai/api/v1/organizations', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json',
          },
        })
      ]);

      if (!projectsResponse.ok) {
        if (projectsResponse.status === 401) {
          throw new Error('Invalid API key. Please check your LlamaCloud API key.');
        }
        throw new Error('Failed to fetch projects from LlamaCloud.');
      }

      const projects = await projectsResponse.json();
      const organizations = organizationsResponse.ok ? await organizationsResponse.json() : [];
      
      // Create a map of organization_id -> organization_name for quick lookup
      const orgMap = new Map();
      if (Array.isArray(organizations)) {
        organizations.forEach((org: any) => {
          orgMap.set(org.id, org.name);
        });
      }
      
      // Enhance projects with organization names
      const enhancedProjects = (projects || []).map((project: any) => ({
        ...project,
        organization_name: orgMap.get(project.organization_id) || 'Unknown Organization'
      }));
      
      setAvailableProjects(enhancedProjects);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch projects';
      setError(errorMessage);
      setAvailableProjects([]);
    } finally {
      setIsFetchingProjects(false);
    }
  };

  // Connect to LlamaCloud project
  const handleConnect = async () => {
    if (!apiKey.trim() || !selectedProjectId) {
      toast({
        title: 'Error',
        description: 'Please enter an API key and select a project.',
        variant: 'destructive',
      });
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const selectedProject = availableProjects.find(p => p.id === selectedProjectId);
      
      const response = await fetch('/api/llamacloud/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organizationId: orgId,
          apiKey: apiKey.trim(),
          projectId: selectedProjectId,
          projectName: selectedProject?.name || 'Unknown Project',
          llamaCloudOrgName: selectedProject?.organization_name || 'Unknown Organization',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to connect to LlamaCloud');
      }

      const updatedOrg = await response.json();
      onConnectionUpdate(updatedOrg.organization);

      toast({
        title: 'Success',
        description: `Connected to LlamaCloud project "${selectedProject?.name}"`,
      });

      // Clear form
      setApiKey('');
      setSelectedProjectId('');
      setAvailableProjects([]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect to LlamaCloud';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect from LlamaCloud
  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    setError(null);

    try {
      const response = await fetch('/api/llamacloud/disconnect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organizationId: orgId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to disconnect from LlamaCloud');
      }

      const updatedOrg = await response.json();
      onConnectionUpdate(updatedOrg.organization);

      toast({
        title: 'Success',
        description: 'Disconnected from LlamaCloud',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to disconnect from LlamaCloud';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="h-5 w-5" />
          LlamaCloud Integration
        </CardTitle>
        <CardDescription>
          Connect your organization to a LlamaCloud project for document indexing and search
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isConnected ? (
          <div className="space-y-4">
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Connected to LlamaCloud</AlertTitle>
              <AlertDescription>
                {organization?.llamaCloudOrgName && organization?.llamaCloudProjectName ? 
                  `Connected to ${organization.llamaCloudOrgName} - ${organization.llamaCloudProjectName}` :
                  `Your organization is connected to the LlamaCloud project "${connectedProjectName}"`
                }
              </AlertDescription>
            </Alert>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {organization?.llamaCloudOrgName 
                      ? `${organization.llamaCloudOrgName} - ${connectedProjectName}`
                      : connectedProjectName
                    }
                  </span>
                  <Badge variant="secondary">Connected</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Project ID: {connectedProjectId}
                </p>
                <p className="text-sm text-muted-foreground">
                  Connected: {new Date(organization.llamaCloudConnectedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={`https://cloud.llamaindex.ai/project/${connectedProjectId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Open Project
                  </a>
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={handleDisconnect}
                  disabled={isDisconnecting}
                >
                  {isDisconnecting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      Disconnecting...
                    </>
                  ) : (
                    <>
                      <Unlink className="h-4 w-4 mr-1" />
                      Disconnect
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="llamacloud-api-key">LlamaCloud API Key</Label>
              <Input
                id="llamacloud-api-key"
                type="password"
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  // Clear previous timeout
                  if (debounceRef.current) {
                    clearTimeout(debounceRef.current);
                  }
                  // Set new timeout for debounced project fetching
                  debounceRef.current = setTimeout(() => {
                    fetchProjects(e.target.value);
                  }, 500);
                }}
                placeholder="Enter your LlamaCloud API key"
                disabled={isValidating || isFetchingProjects}
              />
              <p className="text-xs text-muted-foreground">
                Get your API key from{' '}
                <a 
                  href="https://cloud.llamaindex.ai/api-key" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="underline hover:no-underline"
                >
                  LlamaCloud API Key page
                </a>
              </p>
            </div>

            {isFetchingProjects && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Fetching available projects...
              </div>
            )}

            {availableProjects.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="project-select">Select LlamaCloud Project</Label>
                <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a project to connect to" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableProjects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {project.organization_name} - {project.name}
                          </span>
                          {project.description && (
                            <span className="text-xs text-muted-foreground">{project.description}</span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  This will connect your organization to the selected LlamaCloud project
                </p>
              </div>
            )}

            {apiKey && availableProjects.length === 0 && !isFetchingProjects && !error && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No Projects Found</AlertTitle>
                <AlertDescription>
                  No projects were found for this API key. Make sure you have created a project in LlamaCloud.
                </AlertDescription>
              </Alert>
            )}

            <Button 
              onClick={handleConnect}
              disabled={!apiKey.trim() || !selectedProjectId || isConnecting || isFetchingProjects}
              className="w-full"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Cloud className="h-4 w-4 mr-2" />
                  Connect to LlamaCloud
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 