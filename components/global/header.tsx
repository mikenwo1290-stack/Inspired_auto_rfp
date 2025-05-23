'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { usePathname, useParams, useSearchParams } from 'next/navigation';
import { HelpCircle, LogOut } from 'lucide-react';
import { OrganizationSwitcher } from './organization-switcher';
import { ProjectSwitcher } from './project-switcher';
import Image from 'next/image';
import { logout } from '@/app/login/actions';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';

function HeaderContent() {
  const pathname = usePathname();
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  // Check if we're on different page types
  const isOrgPage = pathname.startsWith('/org/');
  const isProjectPage = pathname.startsWith('/project');
  const showOnHomePage = pathname === '/' || pathname === '/new-organization';
  
  // Get current project and org IDs from URL params
  const currentProjectId = searchParams.get('projectId');
  const currentOrgId = searchParams.get('orgId') || params.orgId as string;
  
  // Don't show if we're not on the home page, org page, or project page
  if (!showOnHomePage && !isOrgPage && !isProjectPage) {
    return null;
  }
  
  return (
    <header className="border-b bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center">
            <Image src="/llamaindex_logo.jpeg" alt="AutoRFP" width={32} height={32} />
            <span className="ml-2 text-xl font-bold">AutoRFP</span>
          </Link>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm">
            <HelpCircle className="mr-2 h-4 w-4" />
            Help
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive cursor-pointer"
                onClick={() => {
                  startTransition(async () => {
                    await logout();
                  });
                }}
                disabled={isPending}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>{isPending ? 'Logging out...' : 'Log out'}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

export function Header() {
  return (
    <Suspense fallback={
      <header className="border-b bg-background">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <div className="h-8 w-32 animate-pulse bg-muted rounded"></div>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-8 w-16 animate-pulse bg-muted rounded"></div>
            <div className="h-8 w-8 animate-pulse bg-muted rounded-full"></div>
          </div>
        </div>
      </header>
    }>
      <HeaderContent />
    </Suspense>
  );
} 