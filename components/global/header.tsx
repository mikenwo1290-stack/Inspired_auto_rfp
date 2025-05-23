'use client';

import React from 'react';
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
import { usePathname, useParams } from 'next/navigation';
import { HelpCircle, LogOut } from 'lucide-react';
import { OrganizationSwitcher } from './organization-switcher';
import Image from 'next/image';

export function Header() {
  const pathname = usePathname();
  const params = useParams();
  
  // Check if we're on an organization page
  const isOrgPage = pathname.startsWith('/org/');
  const showOnHomePage = pathname === '/' || pathname === '/new-organization';
  
  // Don't show if we're not on the home page or org page
  if (!showOnHomePage && !isOrgPage) {
    return null;
  }
  
  return (
    <header className="border-b bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          {showOnHomePage ? (
            <Link href="/" className="flex items-center">
              <Image src="/llamaindex_logo.jpeg" alt="AutoRFP" width={32} height={32} />
              <span className="ml-2 text-xl font-bold">AutoRFP</span>
            </Link>
          ) : (
            // If we're on an org page, show the organization switcher
            <div className="w-64 lg:hidden">
              <OrganizationSwitcher />
            </div>
          )}
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
              <DropdownMenuItem className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
} 