'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, FileText, Search, CheckCircle2, CircleDashed, Users, AlertCircle } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import DocumentDetail from './DocumentDetail'
import { cn } from '@/lib/utils'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface DocumentData {
  id: string
  filename: string
  created_at: string
  file_type: string
  size_bytes: number
  metadata?: Record<string, any>
  organizationName?: string
  organizationId?: string
}

interface OrganizationData {
  id: string
  name: string
  llamaCloudConnectedAt: string | null
}

// Helper functions for new card design
const getDocumentCardStyles = (fileType: string): {
  iconBgClass: string;
  iconColorClass: string;
  textPillBgClass: string;
  textPillTextColorClass: string;
} => {
  const type = (fileType || '').toLowerCase();
  if (type.includes('lease') && !type.includes('sub')) {
    return {
      iconBgClass: 'bg-sky-50', // Lighter blue
      iconColorClass: 'text-sky-600',
      textPillBgClass: 'bg-sky-500',
      textPillTextColorClass: 'text-white',
    };
  }
  if (type.includes('sublease') || type.includes('sub')) { // 'agreement' as another example for purple
    return {
      iconBgClass: 'bg-indigo-50', // Lighter purple
      iconColorClass: 'text-indigo-600',
      textPillBgClass: 'bg-indigo-500',
      textPillTextColorClass: 'text-white',
    };
  }
  if (type === 'pdf') {
    return {
      iconBgClass: 'bg-red-50',
      iconColorClass: 'text-red-600',
      textPillBgClass: 'bg-red-500',
      textPillTextColorClass: 'text-white',
    };
  }
  if (type === 'docx' || type === 'doc') {
    return {
      iconBgClass: 'bg-blue-50',
      iconColorClass: 'text-blue-600',
      textPillBgClass: 'bg-blue-500',
      textPillTextColorClass: 'text-white',
    };
  }
  return { // Fallback default
    iconBgClass: 'bg-gray-100',
    iconColorClass: 'text-gray-600',
    textPillBgClass: 'bg-gray-500',
    textPillTextColorClass: 'text-white',
  };
};

const getPillText = (fileType: string): string => {
  const type = (fileType || '').toLowerCase();
  if (type.includes('lease') && !type.includes('sub')) return 'LEASE';
  if (type.includes('sublease') || type.includes('sub')) return 'SUB';
  if (type.includes('agreement')) return 'AGRMT'; // Example for agreement
  if (type === 'pdf') return 'PDF';
  if (type === 'docx') return 'DOCX';
  if (type === 'doc') return 'DOC';
  if (type.length > 0) return type.substring(0, 3).toUpperCase();
  return 'FILE';
};

export default function DocumentList() {
  const [documents, setDocuments] = useState<DocumentData[]>([])
  const [organizations, setOrganizations] = useState<OrganizationData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    const fetchUserOrganizations = async () => {
      try {
        const response = await fetch('/api/organizations')
        
        if (!response.ok) {
          throw new Error(`Failed to fetch organizations: ${response.status}`)
        }
        
        const orgData = await response.json()
        
        // Filter organizations that have LlamaCloud connections
        const connectedOrgs = orgData.filter((org: OrganizationData) => org.llamaCloudConnectedAt)
        setOrganizations(connectedOrgs)
        
        return connectedOrgs
      } catch (err) {
        console.error('Error fetching organizations:', err)
        throw err
      }
    }

    const fetchDocumentsFromOrganizations = async (orgs: OrganizationData[]) => {
      const allDocuments: DocumentData[] = []
      
      // Fetch documents from each connected organization
      for (const org of orgs) {
        try {
          const response = await fetch(`/api/llamacloud/documents?organizationId=${org.id}`)
          
          if (response.ok) {
            const data = await response.json()
            
            // Transform documents and add organization context
            const orgDocuments = (data.documents || []).map((doc: any) => ({
              id: `${org.id}-${doc.id}`, // Make unique across organizations
              filename: doc.name,
              created_at: doc.created_at,
              file_type: doc.file_type || getFileTypeFromFilename(doc.name || ''),
              size_bytes: doc.size_bytes || 0,
              metadata: {
                pipelineName: doc.pipelineName,
                pipelineId: doc.pipelineId,
                status: doc.status,
                originalId: doc.id,
                ...doc
              },
              organizationName: org.name,
              organizationId: org.id
            }))
            
            allDocuments.push(...orgDocuments)
          }
        } catch (orgError) {
          console.error(`Error fetching documents for organization ${org.name}:`, orgError)
          // Continue with other organizations even if one fails
        }
      }
      
      return allDocuments
    }

    const fetchAllData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const connectedOrgs = await fetchUserOrganizations()
        
        if (connectedOrgs.length === 0) {
          setDocuments([])
          setIsLoading(false)
          return
        }
        
        const allDocuments = await fetchDocumentsFromOrganizations(connectedOrgs)
        setDocuments(allDocuments)
        
      } catch (err) {
        console.error('Error fetching documents:', err)
        setError('Failed to fetch documents. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAllData()
  }, [])

  // Helper function to determine file type from filename if not provided by API
  const getFileTypeFromFilename = (filename: string): string => {
    const extension = filename.split('.').pop()?.toLowerCase() || ''
    const fileTypeMap: Record<string, string> = {
      'pdf': 'pdf',
      'md': 'markdown',
      'doc': 'doc',
      'docx': 'docx',
      'csv': 'csv',
      'txt': 'text',
      'json': 'json'
    }
    
    return fileTypeMap[extension] || 'other'
  }

  // Filter documents based on search term and active tab
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.organizationName?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTab = activeTab === 'all' || doc.file_type === activeTab
    return matchesSearch && matchesTab
  })

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    else if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    else return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const getFileTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      pdf: 'bg-red-100 text-red-800',
      markdown: 'bg-sky-100 text-sky-800', // Updated to match new scheme
      docx: 'bg-blue-100 text-blue-800', // Updated
      doc: 'bg-blue-100 text-blue-800',  // Added doc
      csv: 'bg-green-100 text-green-800', // Kept
      text: 'bg-gray-100 text-gray-800', // Kept
      json: 'bg-yellow-100 text-yellow-800', // Changed amber to yellow for consistency
      other: 'bg-gray-100 text-gray-800'
    }
    return colors[type] || colors.other
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (selectedDocId) {
    return <DocumentDetail documentId={selectedDocId} onBack={() => setSelectedDocId(null)} />
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between animate-pulse">
          <div className="bg-gray-200 h-10 w-full sm:w-96 rounded" />
          <div className="bg-gray-200 h-10 w-full sm:w-64 rounded" />
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="p-4 pb-0">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="bg-gray-200 h-5 w-3/4 rounded mb-2" />
                    <div className="flex items-center mt-2">
                      <div className="bg-gray-200 h-4 w-32 rounded mr-2" />
                      <div className="bg-gray-200 h-4 w-20 rounded" />
                    </div>
                  </div>
                  <div className="bg-gray-200 h-6 w-16 rounded" />
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex justify-end mt-2">
                  <div className="bg-gray-200 h-8 w-24 rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Extract unique file types for tab filters
  const fileTypes = Array.from(new Set(documents.map(doc => doc.file_type)))

  if (filteredDocuments.length === 0) {
    if (organizations.length === 0) {
      return (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Connected Organizations</AlertTitle>
          <AlertDescription>
            No organizations with LlamaCloud connections found. Connect an organization to LlamaCloud to view documents.
          </AlertDescription>
        </Alert>
      )
    }
    
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center h-64">
            <FileText className="text-gray-400 mb-4" size={48} />
            <p className="text-xl font-medium text-gray-600">No documents found</p>
            <p className="text-gray-400">Try adjusting your search or filters</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search documents and organizations..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            {fileTypes.map(type => (
              <TabsTrigger key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {filteredDocuments.length > 0 && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-5">
          {filteredDocuments.map((doc) => {
            const styles = getDocumentCardStyles(doc.file_type);
            const pillText = getPillText(doc.file_type);
            const displayName = doc.metadata?.title || doc.filename;
            // Placeholder for user, adapt if data available in metadata
            const userName = doc.metadata?.author_name || doc.metadata?.user_name;
            // const userAvatar = doc.metadata?.author_avatar_url || "/default-avatar.png"; // Placeholder for avatar image

            return (
              <Card key={doc.id} className="rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out flex flex-col bg-white">
                <CardContent className="flex flex-col items-center p-5 text-center flex-grow w-full">
                  {/* Icon Area */}
                  <div className={cn(
                      "w-[80px] h-[100px] mb-4 rounded-md flex flex-col items-center justify-center pt-2 pb-1 px-1 relative shrink-0",
                      styles.iconBgClass
                  )}>
                    <FileText size={36} className={cn("mb-auto", styles.iconColorClass)} />
                    <div className={cn(
                        "text-[10px] font-bold leading-none py-1 px-2 rounded shadow-sm",
                        styles.textPillBgClass, styles.textPillTextColorClass
                    )}>
                      {pillText}
                    </div>
                    {/* Status Icon Placeholder - This is a visual approximation based on screenshot files */}
                    {/* Actual status should come from doc.metadata or similar */}
                    {pillText === 'LEASE' && (
                      <div className="absolute top-[calc(50%-13px)] right-[5px] bg-white rounded-full p-0.5 shadow-md">
                        <CheckCircle2 size={16} className="text-green-500 block" />
                      </div>
                    )}
                    {pillText === 'SUB' && (
                      <div className="absolute top-[calc(50%-13px)] right-[5px] bg-white rounded-full p-0.5 shadow-md flex items-center justify-center">
                        <CircleDashed size={16} className="text-indigo-500 block" />
                      </div>
                    )}
                  </div>

                  <h3 className="text-sm font-semibold mb-1 leading-tight truncate w-full px-1" title={displayName}>
                    {displayName}
                  </h3>
                  
                  {/* Organization Badge */}
                  {doc.organizationName && (
                    <div className="mb-1">
                      <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                        {doc.organizationName}
                      </Badge>
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500 mb-3">{formatDate(doc.created_at)}</p>

                  {/* User Info Placeholder - adapt if data is in metadata */}
                  <div className="flex items-center text-xs text-gray-600 mt-auto pt-1 min-h-[20px]"> {/* min-h for alignment */}
                    {userName ? (
                      <>
                        {/* <img src={userAvatar} alt={userName} className="w-5 h-5 rounded-full mr-1.5 border border-gray-200" /> */}
                        <Users size={14} className="mr-1.5 text-gray-400" />
                        <span className="truncate max-w-[100px]">{userName}</span>
                      </>
                    ) : (
                      <span className="text-gray-400 italic text-[11px]">No user info</span> // Placeholder text or keep empty
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  )
} 