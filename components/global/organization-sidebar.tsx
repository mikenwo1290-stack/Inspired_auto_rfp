"use client"

import React, { Suspense, useState, useEffect } from "react"
import { 
  Sidebar, 
  SidebarContent,
  SidebarHeader, 
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarTrigger
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { usePathname, useParams } from "next/navigation"
import Link from "next/link"
import { 
  LayoutGrid, 
  Users, 
  FolderOpen, 
  Settings,
  LogOut,
  Command
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Organization } from "@/types/organization"
import { OrganizationSwitcher } from "./organization-switcher"

function OrganizationSidebarContent() {
  const pathname = usePathname()
  const params = useParams()
  const orgId = params?.orgId as string
  
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    const fetchOrganization = async () => {
      if (!orgId) return
      
      try {
        setIsLoading(true)
        const response = await fetch(`/api/organizations/${orgId}`)
        
        if (response.ok) {
          const data = await response.json()
          setOrganization(data)
        }
      } catch (error) {
        console.error("Error fetching organization:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchOrganization()
  }, [orgId])
  
  const menuItems = [
    { id: "projects", label: "Projects", icon: LayoutGrid, path: `/org/${orgId}` },
    { id: "team", label: "Team", icon: Users, path: `/org/${orgId}/team` },
    { id: "documents", label: "Documents", icon: FolderOpen, path: `/org/${orgId}/documents` },
    { id: "settings", label: "Settings", icon: Settings, path: `/org/${orgId}/settings` },
  ]
  
  return (
    <>
      <SidebarHeader className="border-b">
        <div className="p-2">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <OrganizationSwitcher />
            </div>
            <SidebarTrigger />
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu className="space-y-1">
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.id}>
              <Link href={item.path} className="w-full">
                <SidebarMenuButton isActive={pathname === item.path}>
                  <item.icon className="h-4 w-4 mr-2" />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="mt-auto">
        <div className="p-4 border-t">

          <div className="flex mt-6 justify-between">
            <div className="space-y-2">
              <Link href="/account-preferences">
                <Button variant="ghost" size="sm" className="text-xs justify-start px-2 h-7 w-full">
                  Account preferences
                </Button>
              </Link>
              <Link href="/feature-previews">
                <Button variant="ghost" size="sm" className="text-xs justify-start px-2 h-7 w-full">
                  Feature previews
                </Button>
              </Link>
              <Link href="/theme-settings">
                <Button variant="ghost" size="sm" className="text-xs justify-start px-2 h-7 w-full">
                  Theme
                </Button>
              </Link>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Log out">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </SidebarFooter>
    </>
  )
}

export function OrganizationSidebar() {
  return (
    <Sidebar className="border-r z-10">
      <Suspense fallback={
        <div className="p-4 flex flex-col h-screen">
          <div className="h-16 border-b mb-4"></div>
          <div className="flex-1 space-y-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-10 w-full animate-pulse bg-muted rounded"></div>
            ))}
          </div>
        </div>
      }>
        <OrganizationSidebarContent />
      </Suspense>
    </Sidebar>
  )
} 