"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, Calendar, CheckCircle2, Clock, FileText, FolderOpen, MessageSquare, Users } from "lucide-react"
import { RfpDocument } from "@/types/api"
import { formatDistanceToNow, format } from "date-fns"
import { cn } from "@/lib/utils"

interface ProjectOverviewProps {
  onViewQuestions: () => void;
  projectId: string | null;
  orgId?: string | null;
}

export function ProjectOverview({ onViewQuestions, projectId, orgId }: ProjectOverviewProps) {
  const [loading, setLoading] = useState(true)
  const [project, setProject] = useState<any>(null)
  const [rfpDocument, setRfpDocument] = useState<RfpDocument | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [sectionsExpanded, setSectionsExpanded] = useState(false)

  useEffect(() => {
    if (projectId) {
      const fetchProjectData = async () => {
        setLoading(true)
        try {
          // Fetch project details
          const projectResponse = await fetch(`/api/projects/${projectId}`)
          if (!projectResponse.ok) {
            throw new Error("Failed to fetch project details")
          }
          const projectData = await projectResponse.json()
          setProject(projectData)

          // Fetch RFP document with questions
          const rfpResponse = await fetch(`/api/questions/${projectId}`)
          if (!rfpResponse.ok) {
            throw new Error("Failed to fetch RFP questions")
          }
          
          const rfpData = await rfpResponse.json()
          setRfpDocument(rfpData)
        } catch (err) {
          console.error("Error fetching project data:", err)
          setError("Failed to load project data")
        } finally {
          setLoading(false)
        }
      }

      fetchProjectData()
    }
  }, [projectId])

  // Calculate project metrics
  const getTotalQuestions = () => rfpDocument?.sections.reduce((total, section) => total + section.questions.length, 0) || 0
  const getAnsweredQuestions = () => {
    if (!rfpDocument) return 0
    return rfpDocument.sections.reduce((total, section) => {
      return total + section.questions.filter(q => q.answer).length
    }, 0)
  }

  const totalQuestions = getTotalQuestions()
  const answeredQuestions = getAnsweredQuestions()
  const completionPercentage = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-16 mb-1" />
                <Skeleton className="h-3 w-32 mb-3" />
                <Skeleton className="h-2 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        <Skeleton className="h-20 w-full" />
        
        <div className="grid gap-4 md:grid-cols-7">
          <div className="md:col-span-4">
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="md:col-span-3">
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!project) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Project Not Found</AlertTitle>
        <AlertDescription>The requested project could not be found.</AlertDescription>
      </Alert>
    )
  }

  // Format dates
  const createdAt = new Date(project.createdAt)
  const updatedAt = new Date(project.updatedAt)
  const createdAtFormatted = format(createdAt, 'MMM d, yyyy')
  const updatedAtFormatted = format(updatedAt, 'MMM d, yyyy')
  const updatedAtRelative = formatDistanceToNow(updatedAt, { addSuffix: true })

  // Determine which sections to show
  const initialSectionsToShow = 4
  const sortedSections = rfpDocument?.sections ? [...rfpDocument.sections].sort((a, b) => {
    const aAnswered = a.questions.filter(q => q.answer).length
    const bAnswered = b.questions.filter(q => q.answer).length
    const aTotal = a.questions.length
    const bTotal = b.questions.length
    const aPercentage = aTotal > 0 ? aAnswered / aTotal : 0
    const bPercentage = bTotal > 0 ? bAnswered / bTotal : 0
    return bPercentage - aPercentage // Sort by completion percentage (descending)
  }) : []
  
  const sectionsToShow = sectionsExpanded ? sortedSections : sortedSections.slice(0, initialSectionsToShow)
  const hasMoreSections = sortedSections.length > initialSectionsToShow

  return (
    <div className="space-y-6 p-12">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Questions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{answeredQuestions}/{totalQuestions}</div>
            <p className="text-xs text-muted-foreground">{completionPercentage}% completed</p>
            <Progress value={completionPercentage} className="mt-3 h-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Sections</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rfpDocument?.sections.length || 0}</div>
            <p className="text-xs text-muted-foreground">Topic categories</p>
          </CardContent>
        </Card>
        
      </div>

      {answeredQuestions < totalQuestions && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Attention Required</AlertTitle>
          <AlertDescription>
            {totalQuestions - answeredQuestions} {totalQuestions - answeredQuestions === 1 ? 'question needs' : 'questions need'} to be answered.
            <Button size="sm" variant="link" className="p-0 ml-2" onClick={onViewQuestions}>
              View Questions
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-7">


        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
            <CardDescription>Key information about this RFP</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-1 text-sm">
                <div className="col-span-1 font-medium">Project ID:</div>
                <div className="col-span-2">{project.id}</div>
              </div>
              <div className="grid grid-cols-3 gap-1 text-sm">
                <div className="col-span-1 font-medium">Name:</div>
                <div className="col-span-2">{project.name}</div>
              </div>
              {project.description && (
                <div className="grid grid-cols-3 gap-1 text-sm">
                  <div className="col-span-1 font-medium">Description:</div>
                  <div className="col-span-2">{project.description}</div>
                </div>
              )}
              <div className="grid grid-cols-3 gap-1 text-sm">
                <div className="col-span-1 font-medium">Created:</div>
                <div className="col-span-2">{createdAtFormatted}</div>
              </div>
              <div className="grid grid-cols-3 gap-1 text-sm">
                <div className="col-span-1 font-medium">Updated:</div>
                <div className="col-span-2">{updatedAtFormatted} ({updatedAtRelative})</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
