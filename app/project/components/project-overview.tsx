import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, Calendar, CheckCircle2, Clock, FileText, FolderOpen, MessageSquare, Users } from "lucide-react"

interface ProjectOverviewProps {
  onViewQuestions: () => void;
  projectId: string | null;
}

export function ProjectOverview({ onViewQuestions, projectId }: ProjectOverviewProps) {
  return (
    <div className="space-y-6">

      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Questions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">30/80</div>
            <p className="text-xs text-muted-foreground">37.5% completed</p>
            <Progress value={37.5} className="mt-3 h-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12/15</div>
            <p className="text-xs text-muted-foreground">80% processed</p>
            <Progress value={80} className="mt-3 h-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">2 active now</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Time Remaining</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7 days</div>
            <p className="text-xs text-muted-foreground">Due May 15, 2025</p>
          </CardContent>
        </Card>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Attention Required</AlertTitle>
        <AlertDescription>5 questions need review and 3 documents are waiting to be processed.</AlertDescription>
      </Alert>

      <div className="grid gap-4 md:grid-cols-7">
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates on this RFP project</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  user: "John Doe",
                  action: "answered question",
                  item: "Technical Architecture Overview",
                  time: "2 hours ago",
                  icon: CheckCircle2,
                },
                {
                  user: "Sarah Kim",
                  action: "uploaded document",
                  item: "Security Compliance Framework.pdf",
                  time: "5 hours ago",
                  icon: FolderOpen,
                },
                {
                  user: "Mike Johnson",
                  action: "commented on",
                  item: "Pricing Structure",
                  time: "Yesterday",
                  icon: MessageSquare,
                },
                {
                  user: "Lisa Chen",
                  action: "scheduled meeting",
                  item: "RFP Review Session",
                  time: "Yesterday",
                  icon: Calendar,
                },
              ].map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <activity.icon className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm">
                      <span className="font-medium">{activity.user}</span> {activity.action}{" "}
                      <span className="font-medium">{activity.item}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Project Metadata</CardTitle>
            <CardDescription>Key information about this RFP</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-1 text-sm">
                <div className="col-span-1 font-medium">Client:</div>
                <div className="col-span-2">Velocity Labs</div>
              </div>
              <div className="grid grid-cols-3 gap-1 text-sm">
                <div className="col-span-1 font-medium">RFP ID:</div>
                <div className="col-span-2">VL-2025-0042</div>
              </div>
              <div className="grid grid-cols-3 gap-1 text-sm">
                <div className="col-span-1 font-medium">Industry:</div>
                <div className="col-span-2">
                  <Badge variant="outline">Healthcare</Badge> <Badge variant="outline">Enterprise</Badge>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1 text-sm">
                <div className="col-span-1 font-medium">Created:</div>
                <div className="col-span-2">May 1, 2025</div>
              </div>
              <div className="grid grid-cols-3 gap-1 text-sm">
                <div className="col-span-1 font-medium">Modified:</div>
                <div className="col-span-2">May 8, 2025 (Today)</div>
              </div>
              <div className="grid grid-cols-3 gap-1 text-sm">
                <div className="col-span-1 font-medium">Owner:</div>
                <div className="col-span-2">John Doe</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming Tasks</TabsTrigger>
          <TabsTrigger value="ai">AI Suggestions</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {[
              {
                title: "Complete Technical Architecture Section",
                description: "5 questions remaining",
                dueDate: "May 10, 2025",
                priority: "High",
              },
              {
                title: "Review Security Compliance Answers",
                description: "Needs SME approval",
                dueDate: "May 11, 2025",
                priority: "Medium",
              },
              {
                title: "Finalize Pricing Structure",
                description: "Waiting for finance input",
                dueDate: "May 12, 2025",
                priority: "High",
              },
              {
                title: "Upload Case Studies",
                description: "3 documents pending",
                dueDate: "May 13, 2025",
                priority: "Low",
              },
            ].map((task, index) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">{task.title}</CardTitle>
                    <Badge
                      variant="outline"
                      className={
                        task.priority === "High"
                          ? "bg-red-50 text-red-700 hover:bg-red-50"
                          : task.priority === "Medium"
                            ? "bg-yellow-50 text-yellow-700 hover:bg-yellow-50"
                            : "bg-green-50 text-green-700 hover:bg-green-50"
                      }
                    >
                      {task.priority}
                    </Badge>
                  </div>
                  <CardDescription>{task.description}</CardDescription>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>Due: {task.dueDate}</span>
                    </div>
                    <Button size="sm" variant="ghost">
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="ai" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI-Generated Insights</CardTitle>
              <CardDescription>Based on your documents and progress, here are some suggestions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border p-3">
                <h3 className="font-medium">Missing Information Detected</h3>
                <p className="text-sm text-muted-foreground">
                  The client has requested detailed information about your disaster recovery procedures, but this hasn't
                  been addressed in your current answers.
                </p>
                <div className="mt-2 flex justify-end">
                  <Button size="sm" variant="outline">
                    Generate Answer
                  </Button>
                </div>
              </div>
              <div className="rounded-lg border p-3">
                <h3 className="font-medium">Inconsistency Alert</h3>
                <p className="text-sm text-muted-foreground">
                  Your response to the implementation timeline question conflicts with information provided in the
                  project planning section.
                </p>
                <div className="mt-2 flex justify-end">
                  <Button size="sm" variant="outline">
                    Review Answers
                  </Button>
                </div>
              </div>
              <div className="rounded-lg border p-3">
                <h3 className="font-medium">Competitive Advantage</h3>
                <p className="text-sm text-muted-foreground">
                  Based on the RFP requirements, highlighting your company's experience with HIPAA compliance could
                  strengthen your proposal.
                </p>
                <div className="mt-2 flex justify-end">
                  <Button size="sm" variant="outline">
                    Enhance Answer
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
