"use client"

import React, { Suspense } from "react"
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
import { usePathname } from "next/navigation"
import Link from "next/link"
import { 
  Home, 
  FileText, 
  FolderOpen, 
  Settings, 
  Users, 
  Calendar,
  MessageSquare,
  HelpCircle,
  LogOut
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

function HomeSidebarContent() {
  const pathname = usePathname()
  
  const menuItems = [
    { id: "overview", label: "Overview", icon: Home, path: "/" },
    
  ]
  
  const bottomMenuItems = [
    { id: "settings", label: "Settings", icon: Settings, path: "/settings" },
    { id: "help", label: "Help & Support", icon: HelpCircle, path: "/help" },
    { id: "logout", label: "Log out", icon: LogOut, path: "/logout" },
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
              <span className="text-sm font-semibold">AutoRFP</span>
              <span className="text-xs text-muted-foreground">Dashboard</span>
            </div>
          </div>
          <SidebarTrigger />
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <div className="text-xs font-medium text-muted-foreground pl-4 py-2">Navigation</div>
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
        
        <SidebarSeparator className="my-4" />
        
        <div className="text-xs font-medium text-muted-foreground pl-4 py-2">System Status</div>
        <div className="space-y-3 px-4">
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Active Projects</span>
              <span className="font-medium">3/5</span>
            </div>
            <Progress value={60} className="h-2" />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Storage Usage</span>
              <span className="font-medium">40%</span>
            </div>
            <Progress value={40} className="h-2" />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>API Calls</span>
              <span className="font-medium">623/1000</span>
            </div>
            <Progress value={62.3} className="h-2" />
          </div>
        </div>
        
        <SidebarSeparator className="my-4" />
        
        <SidebarMenu className="space-y-1">
          {bottomMenuItems.map((item) => (
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
      <SidebarFooter className="border-t p-4 mt-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/stylized-jd-initials.png" alt="User" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium">John Doe</span>
              <span className="text-xs text-muted-foreground">Admin</span>
            </div>
          </div>
          <Link href="/logout">
            <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Log out">
              <LogOut className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </SidebarFooter>
    </>
  )
}

export function HomeSidebar() {
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
        <HomeSidebarContent />
      </Suspense>
    </Sidebar>
  )
} 