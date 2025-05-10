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
}

export function ProjectOverview({ onViewQuestions, projectId }: ProjectOverviewProps) {
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
    <div className="space-y-6">
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
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Created</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{createdAtFormatted}</div>
            <p className="text-xs text-muted-foreground">{formatDistanceToNow(createdAt, { addSuffix: true })}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{updatedAtFormatted}</div>
            <p className="text-xs text-muted-foreground">{updatedAtRelative}</p>
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
        <Card className="md:col-span-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Project Sections</CardTitle>
              <CardDescription>Topics covered in this RFP</CardDescription>
            </div>
            {hasMoreSections && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSectionsExpanded(!sectionsExpanded)}
                className="text-xs"
              >
                {sectionsExpanded ? "Show less" : "Show all"}
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sectionsToShow.map((section, index) => {
                const totalInSection = section.questions.length;
                const answeredInSection = section.questions.filter(q => q.answer).length;
                const sectionPercentage = totalInSection > 0 ? Math.round((answeredInSection / totalInSection) * 100) : 0;
                
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">{section.title}</span>
                      <span className="text-sm text-muted-foreground">{answeredInSection}/{totalInSection}</span>
                    </div>
                    <Progress value={sectionPercentage} className="h-2" />
                  </div>
                );
              })}
              
              {sectionsToShow.length < sortedSections.length && !sectionsExpanded && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full text-sm text-muted-foreground mt-2" 
                  onClick={() => setSectionsExpanded(true)}
                >
                  Show {sortedSections.length - initialSectionsToShow} more sections...
                </Button>
              )}
              
              {(!rfpDocument?.sections || rfpDocument.sections.length === 0) && (
                <div className="text-center py-4 text-muted-foreground">
                  No sections available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

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

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Project Summary</CardTitle>
              <CardDescription>Quick overview of project status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Completion</span>
                    <span>{completionPercentage}%</span>
                  </div>
                  <Progress value={completionPercentage} className="h-2" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Total Questions</p>
                    <p className="text-2xl font-bold">{totalQuestions}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Answered</p>
                    <p className="text-2xl font-bold">{answeredQuestions}</p>
                  </div>
                </div>
                
                <Button className="w-full" onClick={onViewQuestions}>View All Questions</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="progress">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Section Progress</CardTitle>
                <CardDescription>Detailed breakdown by section</CardDescription>
              </div>
              {hasMoreSections && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSectionsExpanded(!sectionsExpanded)}
                  className="text-xs"
                >
                  {sectionsExpanded ? "Show less" : "Show all"}
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sectionsToShow.map((section, index) => {
                  const totalInSection = section.questions.length;
                  const answeredInSection = section.questions.filter(q => q.answer).length;
                  const unansweredInSection = totalInSection - answeredInSection;
                  const sectionPercentage = totalInSection > 0 ? Math.round((answeredInSection / totalInSection) * 100) : 0;
                  
                  return (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium text-sm">{section.title}</h3>
                        <Badge 
                          variant={sectionPercentage === 100 ? "default" : "outline"} 
                          className={cn(
                            "text-xs",
                            sectionPercentage === 100 
                              ? "bg-green-100 text-green-800 hover:bg-green-100" 
                              : sectionPercentage > 50
                                ? "bg-blue-50 text-blue-700 hover:bg-blue-50"
                                : sectionPercentage > 0
                                  ? "bg-yellow-50 text-yellow-700 hover:bg-yellow-50"
                                  : "bg-gray-100 text-gray-700 hover:bg-gray-100"
                          )}
                        >
                          {answeredInSection}/{totalInSection}
                        </Badge>
                      </div>
                      <Progress 
                        value={sectionPercentage} 
                        className={cn(
                          "h-2",
                          sectionPercentage === 100 
                            ? "bg-green-100" 
                            : sectionPercentage > 0 
                              ? "bg-muted" 
                              : "bg-gray-100"
                        )}
                      />
                    </div>
                  );
                })}

                {sectionsToShow.length < sortedSections.length && !sectionsExpanded && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full text-sm text-muted-foreground mt-2" 
                    onClick={() => setSectionsExpanded(true)}
                  >
                    Show {sortedSections.length - initialSectionsToShow} more sections...
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
