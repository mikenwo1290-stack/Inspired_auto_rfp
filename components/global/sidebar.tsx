"use client"

import React, { Suspense, useState, useEffect } from "react"
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
import { FileText, Database, LayoutGrid, Table, Settings, MessageSquare, ChevronRight, LogOut, Command, ArrowLeft } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { usePathname, useSearchParams } from "next/navigation"
import Link from "next/link"
import { RfpDocument } from "@/types/api"
import { OrganizationSwitcher } from "./organization-switcher"

// Create a separate client component that uses useSearchParams
function SidebarInnerContent() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const projectId = searchParams.get("projectId")
  const orgId = searchParams.get("orgId")
  
  // Data states
  const [project, setProject] = useState<any>(null)
  const [rfpDocument, setRfpDocument] = useState<RfpDocument | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [projectName, setProjectName] = useState("")
  const [clientName, setClientName] = useState("Client")
  
  // Fetch project data when projectId changes
  useEffect(() => {
    if (projectId) {
      const fetchProjectData = async () => {
        setIsLoading(true)
        try {
          // Fetch project details
          const projectResponse = await fetch(`/api/projects/${projectId}`)
          if (projectResponse.ok) {
            const projectData = await projectResponse.json()
            setProject(projectData)
            setProjectName(projectData.name || "Unnamed Project")
            
            // For demo purposes, extract client name from project name if possible
            if (projectData.name && projectData.name.includes("for")) {
              setClientName(projectData.name.split("for")[1].trim())
            } else if (projectData.description && projectData.description.includes("client:")) {
              setClientName(projectData.description.split("client:")[1].split(",")[0].trim())
            }

            // Fetch RFP document with questions
            const rfpResponse = await fetch(`/api/questions/${projectId}`)
            if (rfpResponse.ok) {
              const rfpData = await rfpResponse.json()
              setRfpDocument(rfpData)
            }
          }
        } catch (err) {
          console.error("Error fetching project data:", err)
        } finally {
          setIsLoading(false)
        }
      }

      fetchProjectData()
    }
  }, [projectId])
  
  // Calculate metrics
  const getTotalQuestions = () => rfpDocument?.sections.reduce((total, section) => total + section.questions.length, 0) || 0
  const getAnsweredQuestions = () => {
    if (!rfpDocument) return 0
    return rfpDocument.sections.reduce((total, section) => {
      return total + section.questions.filter(q => q.answer).length
    }, 0)
  }
  
  const totalQuestions = getTotalQuestions()
  const answeredQuestions = getAnsweredQuestions()
  const questionsCompletionPercentage = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0
  
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
  
  const addParamsToPath = (path: string) => {
    // Add both projectId and orgId to URLs
    const baseParams = new URLSearchParams()
    if (projectId) baseParams.set("projectId", projectId)
    if (orgId) baseParams.set("orgId", orgId)
    
    // Return path with parameters
    const queryString = baseParams.toString()
    return queryString ? `${path}?${queryString}` : path
  }
  
  const menuItems = [
    { id: "overview", label: "Project", icon: LayoutGrid, path: addParamsToPath("/project") },
    { id: "questions", label: "Questions", icon: FileText, path: addParamsToPath("/questions") },
    { id: "documents", label: "Documents", icon: Database, path: addParamsToPath("/documents") },
   
   
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
      <SidebarContent>
        <div className="px-2 py-4">
          {/* Project info */}
          <div className="mb-4 px-2 py-2 rounded-md border">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/letter-v-floral.png" alt="Project" />
                <AvatarFallback>
                  {clientName ? clientName.substring(0, 2).toUpperCase() : "P"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-semibold">{projectName || "Project"}</span>
                <span className="text-xs text-muted-foreground">zhaoqi@runllama.ai's Project</span>
              </div>
            </div>
          </div>
        
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
          
          <div className="text-xs font-medium text-muted-foreground px-4 py-2">Project Status</div>
          <div className="space-y-3 px-4">
            {isLoading ? (
              <>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-3 w-10" />
                  </div>
                  <Skeleton className="h-2 w-full" />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Questions Answered</span>
                    <span className="font-medium">{answeredQuestions}/{totalQuestions}</span>
                  </div>
                  <Progress value={questionsCompletionPercentage} className="h-2" />
                </div>
              </>
            )}
          </div>
        </div>
      </SidebarContent>
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