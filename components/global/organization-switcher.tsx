'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { SearchIcon, PlusIcon, CheckIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { Organization } from '@/types/organization';

export function OrganizationSwitcher() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { toast } = useToast();

  // Get the current organization ID from the URL or project
  const urlOrgId = searchParams.get('orgId');
  const projectId = searchParams.get('projectId');

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/organizations');
        if (!response.ok) {
          throw new Error('Failed to fetch organizations');
        }
        const data = await response.json();
        setOrganizations(data);
      } catch (error) {
        console.error('Error fetching organizations:', error);
        toast({
          title: "Error",
          description: "Failed to load organizations",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrganizations();
  }, [toast]);

  // Effect to determine current organization
  useEffect(() => {
    const determineCurrentOrganization = async () => {
      if (urlOrgId) {
        // If we have orgId in URL, use it
        const org = organizations.find(org => org.id === urlOrgId);
        setCurrentOrganization(org || null);
      } else if (projectId && organizations.length > 0) {
        // If we have projectId but no orgId, fetch the project to get orgId
        try {
          const response = await fetch(`/api/projects/${projectId}`);
          if (response.ok) {
            const project = await response.json();
            const org = organizations.find(org => org.id === project.organizationId);
            setCurrentOrganization(org || null);
          }
        } catch (error) {
          console.error('Error fetching project for organization:', error);
        }
      } else if (pathname.startsWith('/org/')) {
        // Extract orgId from pathname like /org/[orgId]
        const pathOrgId = pathname.split('/')[2];
        const org = organizations.find(org => org.id === pathOrgId);
        setCurrentOrganization(org || null);
      } else {
        setCurrentOrganization(null);
      }
    };

    if (organizations.length > 0) {
      determineCurrentOrganization();
    }
  }, [urlOrgId, projectId, pathname, organizations]);

  // Filter organizations based on search
  const filteredOrganizations = organizations.filter(org => 
    org.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOrganizationSelect = (orgId: string) => {
    router.push(`/org/${orgId}`);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          className="flex items-center justify-between w-full px-3 py-2 h-auto text-left"
        >
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">
              {currentOrganization?.name?.charAt(0).toUpperCase() || '?'}
            </div>
            <span className="truncate max-w-[150px]">
              {currentOrganization?.name || 'Select organization'}
            </span>
          </div>
          <div className="ml-2 rounded-full bg-muted px-2 py-1 text-xs">
            Free
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-2 border-b">
          <div className="relative">
            <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Find organization..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {/* Current organization with check mark */}
          {filteredOrganizations.map(org => (
            <button
              key={org.id}
              className="w-full flex items-center justify-between p-2 hover:bg-muted text-left"
              onClick={() => handleOrganizationSelect(org.id)}
            >
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">
                  {org.name.charAt(0).toUpperCase()}
                </div>
                <span>{org.name}</span>
              </div>
              {org.id === currentOrganization?.id && (
                <CheckIcon className="h-4 w-4 text-primary" />
              )}
            </button>
          ))}
        </div>
        <div className="border-t">
          <Link 
            href="/"
            className="w-full flex items-center p-2 hover:bg-muted"
            onClick={() => setOpen(false)}
          >
            <span className="px-2">All Organizations</span>
          </Link>
          <Link 
            href="/new-organization"
            className="w-full flex items-center p-2 hover:bg-muted"
            onClick={() => setOpen(false)}
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            <span>New organization</span>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
} 