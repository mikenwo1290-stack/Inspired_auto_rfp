'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import {
  PlusCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Organization } from '@/types/organization';

export function OrganizationSelector({ 
  currentOrganizationId,
  onCreateNew 
}: { 
  currentOrganizationId?: string;
  onCreateNew: () => void;
}) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/organizations');
        if (response.ok) {
          const data = await response.json();
          setOrganizations(data);
        }
      } catch (error) {
        console.error('Error fetching organizations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrganizations();
  }, []);

  const handleOrganizationChange = (orgId: string) => {
    if (orgId !== currentOrganizationId) {
      const org = organizations.find(o => o.id === orgId);
      if (org) {
        router.push(`/organizations/${org.slug}`);
      }
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Select
        disabled={isLoading || organizations.length === 0}
        value={currentOrganizationId}
        onValueChange={handleOrganizationChange}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder={isLoading ? 'Loading...' : 'Select organization'} />
        </SelectTrigger>
        <SelectContent>
          {organizations.map((org) => (
            <SelectItem key={org.id} value={org.id}>
              {org.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Button 
        variant="outline"
        size="icon"
        onClick={onCreateNew}
        title="Create new organization"
      >
        <PlusCircle className="h-4 w-4" />
      </Button>
    </div>
  );
} 