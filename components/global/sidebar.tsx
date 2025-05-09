"use client"

import React, { Suspense } from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar
} from "@/components/ui/sidebar"
import { Calendar, FileText, FolderOpen, HelpCircle, Home, MessageSquare, Settings, Users } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { usePathname, useSearchParams } from "next/navigation"
import Link from "next/link"

// Create a separate client component that uses useSearchParams
function SidebarInnerContent() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const projectId = searchParams.get("projectId")
  
  const getIsActive = (path: string) => {
    // For exact matches
    if (pathname === path) return true
    
    // For paths with projectId
    if (path.includes('?') && projectId) {
      const basePath = path.split('?')[0]
      return pathname === basePath
    }
    
    return false
  }
  
  const menuItems = [
    { id: "overview", label: "Overview", icon: Home, path: projectId ? `/project?projectId=${projectId}` : "/project" },
    { id: "questions", label: "Questions", icon: FileText, path: projectId ? `/questions?projectId=${projectId}` : "/questions" },
    { id: "documents", label: "Documents", icon: FolderOpen, path: projectId ? `/upload?projectId=${projectId}` : "/upload" },
    { id: "team", label: "Team", icon: Users, path: projectId ? `/team?projectId=${projectId}` : "/team" },
    { id: "activity", label: "Activity", icon: Calendar, path: projectId ? `/activity?projectId=${projectId}` : "/activity" },
    { id: "messages", label: "Messages", icon: MessageSquare, path: projectId ? `/messages?projectId=${projectId}` : "/messages" },
  ]
  
  const bottomMenuItems = [
    { id: "settings", label: "Settings", icon: Settings, path: "/settings" },
    { id: "help", label: "Help & Support", icon: HelpCircle, path: "/help" },
  ]

  return (
    <>
      <SidebarHeader className="border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/letter-v-floral.png" alt="VL" />
              <AvatarFallback>VL</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">Software Dev RFP</span>
              <span className="text-xs text-muted-foreground">Velocity Labs</span>
            </div>
          </div>
          <SidebarTrigger />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <div className="p-2">
          <div className="text-xs font-medium text-muted-foreground pl-4 py-2">Navigation</div>
          <SidebarMenu className="space-y-1">
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.id}>
                <Link href={item.path} className="w-full">
                  <SidebarMenuButton isActive={getIsActive(item.path)}>
                    <item.icon className="h-4 w-4 mr-2" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
          
          <SidebarSeparator className="my-4" />
          
          <div className="text-xs font-medium text-muted-foreground pl-4 py-2">Project Status</div>
          <div className="space-y-3 px-4">
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Questions Answered</span>
                <span className="font-medium">30/80</span>
              </div>
              <Progress value={37.5} className="h-2" />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Documents Processed</span>
                <span className="font-medium">12/15</span>
              </div>
              <Progress value={80} className="h-2" />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Overall Completion</span>
                <span className="font-medium">45%</span>
              </div>
              <Progress value={45} className="h-2" />
            </div>
          </div>
          
          <SidebarSeparator className="my-4" />
          
          <SidebarMenu className="space-y-1">
            {bottomMenuItems.map((item) => (
              <SidebarMenuItem key={item.id}>
                <Link href={item.path} className="w-full">
                  <SidebarMenuButton isActive={getIsActive(item.path)}>
                    <item.icon className="h-4 w-4 mr-2" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </div>
      </SidebarContent>
      <SidebarFooter className="border-t p-4 mt-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/stylized-jd-initials.png" alt="User" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium">John Doe</span>
              <span className="text-xs text-muted-foreground">Project Owner</span>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </>
  )
}

export function GlobalSidebar() {
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
        <SidebarInnerContent />
      </Suspense>
    </Sidebar>
  )
} 