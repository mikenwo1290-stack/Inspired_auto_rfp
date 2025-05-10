'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, Calendar, Download, FileText } from 'lucide-react'

interface DocumentDetailProps {
  documentId: string
  onBack: () => void
}

// NOTE: For production use, create a .env.local file with the following variables:
// NEXT_PUBLIC_LLAMAINDEX_API_KEY=your_api_key_here
// NEXT_PUBLIC_LLAMAINDEX_PROJECT_ID=your_project_id_here
// NEXT_PUBLIC_LLAMAINDEX_ORGANIZATION_ID=your_organization_id_here
const PROJECT_ID = process.env.NEXT_PUBLIC_LLAMAINDEX_PROJECT_ID || ''
const ORGANIZATION_ID = process.env.NEXT_PUBLIC_LLAMAINDEX_ORGANIZATION_ID || ''
const API_BASE_URL = 'https://api.cloud.llamaindex.ai/api/v1'
const LLAMA_CLOUD_API_KEY = process.env.LLAMA_CLOUD_API_KEY || ''

interface DocumentData {
  id: string
  filename: string
  created_at: string
  file_type: string
  size_bytes: number
  content?: string
  metadata?: Record<string, any>
  text_chunks?: string[]
}

export default function DocumentDetail({ documentId, onBack }: DocumentDetailProps) {
  const [document, setDocument] = useState<DocumentData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        // Get file metadata
        const response = await fetch(
          `${API_BASE_URL}/files/${documentId}?project_id=${PROJECT_ID}&organization_id=${ORGANIZATION_ID}`, 
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
        
        const fileData = await response.json()
        
        // For content retrieval, we might need to fetch the file content separately
        // using a different endpoint depending on LlamaIndex's API structure
        let content = null
        let chunks = []
        
        try {
          // This is a hypothetical endpoint - we'd need to check LlamaIndex docs for the actual endpoint
          const contentResponse = await fetch(
            `${API_BASE_URL}/files/${documentId}/content?project_id=${PROJECT_ID}&organization_id=${ORGANIZATION_ID}`,
            {
              headers: {
                'Authorization': `Bearer ${LLAMA_CLOUD_API_KEY}`,
                'Content-Type': 'application/json'
              }
            }
          )
          
          if (contentResponse.ok) {
            const contentData = await contentResponse.json()
            content = contentData.content
            chunks = contentData.chunks || []
          }
        } catch (contentErr) {
          console.error('Error fetching file content:', contentErr)
          // Continue with metadata only if content fetch fails
        }
        
        // Transform the API response to match our DocumentData interface
        const docData: DocumentData = {
          id: fileData.id,
          filename: fileData.name || `document-${fileData.id}`,
          created_at: fileData.created_at || new Date().toISOString(),
          file_type: fileData.file_type || getFileTypeFromFilename(fileData.name || ''),
          size_bytes: fileData.file_size || 0,
          content: content,
          text_chunks: chunks,
          metadata: {
            external_file_id: fileData.external_file_id,
            project_id: fileData.project_id,
            last_modified_at: fileData.last_modified_at,
            updated_at: fileData.updated_at,
            ...fileData.resource_info
          }
        }
        
        setDocument(docData)
        setIsLoading(false)
      } catch (err) {
        console.error('Error fetching document details:', err)
        setError('Failed to fetch document details. Please try again later.')
        setIsLoading(false)
      }
    }

    fetchDocument()
  }, [documentId])

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

  // Function to handle document download
  const handleDownload = async () => {
    if (!document) return
    
    try {
      // Download file using the appropriate endpoint
      const response = await fetch(
        `${API_BASE_URL}/files/${documentId}/download?project_id=${PROJECT_ID}&organization_id=${ORGANIZATION_ID}`,
        {
          headers: {
            'Authorization': `Bearer ${LLAMA_CLOUD_API_KEY}`
          }
        }
      )
      
      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`)
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = window.document.createElement('a')
      a.href = url
      a.download = document.filename
      window.document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      window.document.body.removeChild(a)
    } catch (err) {
      console.error('Error downloading document:', err)
      alert('Failed to download document. Please try again later.')
    }
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <Button variant="ghost" className="w-fit p-0 h-auto mb-4" onClick={onBack}>
            <ArrowLeft size={16} className="mr-2" />
            Back to Documents
          </Button>
        </CardHeader>
        <CardContent>
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
      <Card className="w-full">
        <CardHeader>
          <Button variant="ghost" className="w-fit p-0 h-auto mb-4" onClick={onBack}>
            <ArrowLeft size={16} className="mr-2" />
            Back to Documents
          </Button>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-20 w-full mt-6" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!document) {
    return (
      <Card className="w-full">
        <CardHeader>
          <Button variant="ghost" className="w-fit p-0 h-auto mb-4" onClick={onBack}>
            <ArrowLeft size={16} className="mr-2" />
            Back to Documents
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-64">
            <FileText className="text-gray-400 mb-4" size={48} />
            <p className="text-xl font-medium text-gray-600">Document not found</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <Button variant="ghost" className="w-fit p-0 h-auto mb-4" onClick={onBack}>
          <ArrowLeft size={16} className="mr-2" />
          Back to Documents
        </Button>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-2xl font-bold">{document.filename}</CardTitle>
            <div className="flex items-center mt-2 text-sm text-gray-500">
              <Calendar size={14} className="mr-1" />
              <span>{formatDate(document.created_at)}</span>
              <span className="mx-2">•</span>
              <span>{formatFileSize(document.size_bytes)}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge className={getFileTypeColor(document.file_type)}>
              {document.file_type.toUpperCase()}
            </Badge>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download size={14} className="mr-2" />
              Download
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6 mt-2">
          {document.metadata && Object.keys(document.metadata).length > 0 && (
            <div>
              <h3 className="text-md font-semibold mb-2">Metadata</h3>
              <div className="bg-slate-50 p-4 rounded-md">
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                  {Object.entries(document.metadata).map(([key, value]) => (
                    <div key={key} className="py-1">
                      <dt className="text-sm font-medium text-gray-500 capitalize">
                        {key.replace(/_/g, ' ')}
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {Array.isArray(value) 
                          ? value.map(tag => (
                              <Badge key={tag} variant="secondary" className="mr-1 mb-1">
                                {tag}
                              </Badge>
                            ))
                          : String(value)
                        }
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          )}
          
          {document.content && (
            <div>
              <h3 className="text-md font-semibold mb-2">Content</h3>
              <div className="bg-slate-50 p-3 rounded-md text-sm whitespace-pre-line">
                {document.content}
              </div>
            </div>
          )}
          
          {document.text_chunks && document.text_chunks.length > 0 && (
            <div>
              <h3 className="text-md font-semibold mb-2">Content Chunks</h3>
              <div className="space-y-3">
                {document.text_chunks.map((chunk, index) => (
                  <div key={index} className="bg-slate-50 p-3 rounded-md text-sm whitespace-pre-line">
                    {chunk}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 