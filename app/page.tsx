"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon, SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { organizationService } from "@/lib/organization-service";

export default function HomePage() {
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const { toast } = useToast();

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

  // Filter organizations based on search
  const filteredOrganizations = organizations.filter(org => 
    org.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto max-w-7xl py-10 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold">Your Organizations</h1>
        
        {/* Search and Create */}
        <div className="flex gap-2">
          <div className="relative flex-1 max-w-md">
            <Input
              type="text"
              placeholder="Search for an organization"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9"
            />
            <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          </div>
          <Button onClick={() => router.push('/new-organization')}>
            <PlusIcon className="mr-2 h-4 w-4" />
            New organization
          </Button>
        </div>
        
        {/* Organizations List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 rounded-md border border-border animate-pulse bg-muted/20" />
            ))
          ) : filteredOrganizations.length > 0 ? (
            filteredOrganizations.map((org) => (
              <Link href={`/org/${org.id}`} key={org.id}>
                <div className="border rounded-md p-4 hover:border-foreground transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center text-primary font-semibold">
                      {org.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-medium">{org.name}</h3>
                      <p className="text-xs text-muted-foreground">Free</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center p-8 border rounded-md">
              <p className="text-muted-foreground">No organizations found</p>
              <Button 
                className="mt-4"
                onClick={() => router.push('/new-organization')}
              >
                <PlusIcon className="mr-2 h-4 w-4" />
                Create your first organization
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
