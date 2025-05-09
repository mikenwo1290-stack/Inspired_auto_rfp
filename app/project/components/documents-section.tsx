import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  AlertCircle,
  ArrowUpDown,
  Check,
  File,
  FileText,
  Filter,
  FolderOpen,
  MoreHorizontal,
  Plus,
  Search,
  Upload,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function DocumentsSection() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Documents</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search documents..." className="w-[250px] pl-8" />
          </div>
          <Button variant="outline" size="sm" className="gap-1">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button size="sm" className="gap-1">
            <Upload className="h-4 w-4" />
            Upload
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Documents (15)</TabsTrigger>
          <TabsTrigger value="uploaded">Uploaded (12)</TabsTrigger>
          <TabsTrigger value="processing">Processing (3)</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Document Library</CardTitle>
                <Button variant="outline" size="sm" className="gap-1">
                  <ArrowUpDown className="h-3.5 w-3.5" />
                  Sort
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="grid grid-cols-12 gap-2 rounded-md border bg-muted/50 p-2 text-xs font-medium">
                  <div className="col-span-5">Name</div>
                  <div className="col-span-2">Type</div>
                  <div className="col-span-2">Size</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-1">Actions</div>
                </div>
                {[
                  {
                    name: "RFP_Requirements.pdf",
                    type: "PDF",
                    size: "2.4 MB",
                    status: "Processed",
                    icon: FileText,
                  },
                  {
                    name: "Technical_Capabilities.pdf",
                    type: "PDF",
                    size: "4.1 MB",
                    status: "Processed",
                    icon: FileText,
                  },
                  {
                    name: "Previous_RFP_Responses.pdf",
                    type: "PDF",
                    size: "8.7 MB",
                    status: "Processed",
                    icon: FileText,
                  },
                  {
                    name: "Security_Compliance_Framework.pdf",
                    type: "PDF",
                    size: "1.8 MB",
                    status: "Processed",
                    icon: FileText,
                  },
                  {
                    name: "Project_Timeline.xlsx",
                    type: "Excel",
                    size: "1.2 MB",
                    status: "Processed",
                    icon: File,
                  },
                  {
                    name: "Cost_Breakdown.xlsx",
                    type: "Excel",
                    size: "980 KB",
                    status: "Processing",
                    icon: File,
                  },
                  {
                    name: "Case_Studies.pdf",
                    type: "PDF",
                    size: "5.3 MB",
                    status: "Processing",
                    icon: FileText,
                  },
                  {
                    name: "Team_Bios.docx",
                    type: "Word",
                    size: "1.5 MB",
                    status: "Processing",
                    icon: File,
                  },
                ].map((doc, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 rounded-md border p-2 text-sm hover:bg-muted/50">
                    <div className="col-span-5 flex items-center gap-2">
                      <doc.icon className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{doc.name}</span>
                    </div>
                    <div className="col-span-2 flex items-center">{doc.type}</div>
                    <div className="col-span-2 flex items-center">{doc.size}</div>
                    <div className="col-span-2 flex items-center">
                      {doc.status === "Processed" ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          <Check className="mr-1 h-3 w-3" />
                          {doc.status}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                          <AlertCircle className="mr-1 h-3 w-3" />
                          {doc.status}
                        </Badge>
                      )}
                    </div>
                    <div className="col-span-1 flex items-center justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View</DropdownMenuItem>
                          <DropdownMenuItem>Download</DropdownMenuItem>
                          <DropdownMenuItem>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Document Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    { name: "RFP Requirements", count: 2, icon: FolderOpen },
                    { name: "Technical Documentation", count: 3, icon: FolderOpen },
                    { name: "Company Information", count: 4, icon: FolderOpen },
                    { name: "Financial Documents", count: 2, icon: FolderOpen },
                    { name: "Case Studies", count: 1, icon: FolderOpen },
                  ].map((category, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-md border p-2 hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-2">
                        <category.icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{category.name}</span>
                      </div>
                      <Badge variant="outline">{category.count}</Badge>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="mt-2 w-full gap-1">
                    <Plus className="h-3.5 w-3.5" />
                    Add Category
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Document Processing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-lg border p-3">
                    <h3 className="text-sm font-medium">Processing Status</h3>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Cost_Breakdown.xlsx</span>
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                          60%
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Case_Studies.pdf</span>
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                          85%
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Team_Bios.docx</span>
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                          40%
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-lg border p-3">
                    <h3 className="text-sm font-medium">Processing Errors</h3>
                    <div className="mt-2 text-sm text-muted-foreground">No processing errors detected.</div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full gap-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    View Processing Logs
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="uploaded">
          <Card className="flex h-[400px] items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground">Showing 12 uploaded documents. Select a filter to narrow down.</p>
            </div>
          </Card>
        </TabsContent>
        <TabsContent value="processing">
          <Card className="flex h-[400px] items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground">Showing 3 documents currently being processed.</p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
