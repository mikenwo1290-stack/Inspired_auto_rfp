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
import { Calendar, FileText, FolderOpen, HelpCircle, Home, MessageSquare, Settings, Users } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { usePathname, useSearchParams } from "next/navigation"
import Link from "next/link"
import { RfpDocument } from "@/types/api"

// Create a separate client component that uses useSearchParams
function SidebarInnerContent() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const projectId = searchParams.get("projectId")
  
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
  
  // Mock document processing (would need actual API for this in a real app)
  const totalDocuments = 0 // This would come from an API in a real implementation
  const processedDocuments = 0 // This would come from an API in a real implementation
  const documentsCompletionPercentage = totalDocuments > 0 ? Math.round((processedDocuments / totalDocuments) * 100) : 0
  
  // Overall completion is the average of questions and documents completion
  const overallCompletionPercentage = Math.round((questionsCompletionPercentage + documentsCompletionPercentage) / 2)
  
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
              <AvatarFallback>
                {clientName ? clientName.substring(0, 2).toUpperCase() : "VL"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">{projectName || "Software Dev RFP"}</span>
              <span className="text-xs text-muted-foreground">{clientName}</span>
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
            {isLoading ? (
              <>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-3 w-10" />
                  </div>
                  <Skeleton className="h-2 w-full" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-3 w-10" />
                  </div>
                  <Skeleton className="h-2 w-full" />
                </div>
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
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Documents Processed</span>
                    <span className="font-medium">{processedDocuments}/{totalDocuments}</span>
                  </div>
                  <Progress value={documentsCompletionPercentage} className="h-2" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Overall Completion</span>
                    <span className="font-medium">{overallCompletionPercentage}%</span>
                  </div>
                  <Progress value={overallCompletionPercentage} className="h-2" />
                </div>
              </>
            )}
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