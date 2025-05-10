'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, FileText, Search } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import DocumentDetail from './DocumentDetail'

interface DocumentData {
  id: string
  filename: string
  created_at: string
  file_type: string
  size_bytes: number
  metadata?: Record<string, any>
}

// NOTE: For production use, create a .env.local file with the following variables:
// NEXT_PUBLIC_LLAMAINDEX_API_KEY=your_api_key_here
// NEXT_PUBLIC_LLAMAINDEX_PROJECT_ID=your_project_id_here
// NEXT_PUBLIC_LLAMAINDEX_ORGANIZATION_ID=your_organization_id_here
const PROJECT_ID = process.env.NEXT_PUBLIC_LLAMAINDEX_PROJECT_ID || ''
const ORGANIZATION_ID = process.env.NEXT_PUBLIC_LLAMAINDEX_ORGANIZATION_ID || ''
const API_BASE_URL = 'https://api.cloud.llamaindex.ai/api/v1'
const LLAMA_CLOUD_API_KEY = process.env.LLAMA_CLOUD_API_KEY || ''

export default function DocumentList() {
  const [documents, setDocuments] = useState<DocumentData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/files?project_id=${PROJECT_ID}&organization_id=${ORGANIZATION_ID}`, 
          {
            headers: {
              'Authorization': `Bearer ${LLAMA_CLOUD_API_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        )
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }
        
        const data = await response.json()
        
        // Transform the API response to match our DocumentData interface
        const documentList: DocumentData[] = data.map((file: any) => ({
          id: file.id,
          filename: file.name || `document-${file.id}`,
          created_at: file.created_at || new Date().toISOString(),
          file_type: file.file_type || getFileTypeFromFilename(file.name || ''),
          size_bytes: file.file_size || 0,
          metadata: {
            external_file_id: file.external_file_id,
            project_id: file.project_id,
            last_modified_at: file.last_modified_at,
            ...file.resource_info
          }
        }))
        
        setDocuments(documentList)
        setIsLoading(false)
      } catch (err) {
        console.error('Error fetching documents:', err)
        setError('Failed to fetch documents. Please try again later.')
        setIsLoading(false)
      }
    }

    fetchDocuments()
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
    const matchesSearch = doc.filename.toLowerCase().includes(searchTerm.toLowerCase())
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
      markdown: 'bg-blue-100 text-blue-800',
      docx: 'bg-violet-100 text-violet-800',
      csv: 'bg-green-100 text-green-800',
      text: 'bg-gray-100 text-gray-800',
      json: 'bg-amber-100 text-amber-800',
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search documents..."
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

      {filteredDocuments.length === 0 ? (
        <Card className="w-full">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center h-64">
              <FileText className="text-gray-400 mb-4" size={48} />
              <p className="text-xl font-medium text-gray-600">No documents found</p>
              <p className="text-gray-400">Try adjusting your search or filters</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredDocuments.map((doc) => (
            <Card key={doc.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="p-4 pb-0">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg font-medium">{doc.filename}</CardTitle>
                    <div className="flex items-center mt-2 text-sm text-gray-500">
                      <Calendar size={14} className="mr-1" />
                      <span>{formatDate(doc.created_at)}</span>
                      <span className="mx-2">•</span>
                      <span>{formatFileSize(doc.size_bytes)}</span>
                    </div>
                  </div>
                  <Badge className={getFileTypeColor(doc.file_type)}>
                    {doc.file_type.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex justify-end mt-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedDocId(doc.id)}
                  >
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 