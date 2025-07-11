"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, Calendar, CheckCircle2, Clock, FileText, FolderOpen, MessageSquare, Users, Download, Info } from "lucide-react"
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
      <div className="space-y-6 p-12">
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

  const unansweredQuestions = totalQuestions - answeredQuestions

  return (
    <div className="space-y-6 p-12">
      {/* Action buttons */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold mb-2">{project.name}</h1>
          {project.description && (
            <p className="text-muted-foreground">{project.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button 
            variant="outline"
            onClick={onViewQuestions}
          >
            View Questions
          </Button>
        </div>
      </div>

      {/* Main metrics cards - 2x2 grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Questions card */}
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
        
        {/* Sections card */}
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

        {/* Project Details card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Project Details</CardTitle>
            <Info className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Project ID:</span>
                <span className="font-mono text-xs">{project.id.slice(0, 8)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name:</span>
                <span className="truncate ml-2">{project.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created:</span>
                <span>{createdAtFormatted}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Updated:</span>
                <span>{updatedAtFormatted}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attention Required card */}
        <Card className={cn(
          "border-l-4",
          unansweredQuestions > 0 ? "border-l-orange-500 bg-orange-50/30" : "border-l-green-500 bg-green-50/30"
        )}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {unansweredQuestions > 0 ? "Attention Required" : "All Complete"}
            </CardTitle>
            {unansweredQuestions > 0 ? (
              <AlertCircle className="h-4 w-4 text-orange-500" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            )}
          </CardHeader>
          <CardContent>
            {unansweredQuestions > 0 ? (
              <>
                <div className="text-2xl font-bold text-orange-600">{unansweredQuestions}</div>
                <p className="text-xs text-muted-foreground mb-3">
                  {unansweredQuestions === 1 ? 'question needs' : 'questions need'} to be answered
                </p>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full text-xs"
                  onClick={onViewQuestions}
                >
                  View Questions
                </Button>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold text-green-600">✓</div>
                <p className="text-xs text-muted-foreground">All questions answered</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
