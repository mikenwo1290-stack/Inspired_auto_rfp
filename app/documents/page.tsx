import { Suspense } from 'react'
import DocumentList from './components/DocumentList'
import DocumentListSkeleton from './components/DocumentListSkeleton'
import { DocumentsSection } from '@/app/projects/components/documents-section'

export const metadata = {
  title: 'Documents',
  description: 'View and manage documents',
}

interface DocumentsPageProps {
  searchParams: Promise<{
    projectId?: string
    orgId?: string
  }>
}

export default async function DocumentsPage({ searchParams }: DocumentsPageProps) {
  const params = await searchParams
  const projectId = params.projectId
  
  // If we have a projectId, show project-specific documents
  if (projectId) {
    return (
      <div className="container mx-auto p-12">
        <Suspense fallback={<DocumentListSkeleton />}>
          <DocumentsSection projectId={projectId} />
        </Suspense>
      </div>
    )
  }
  
  // Otherwise show global documents
  return (
    <div className="container mx-auto p-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Document Repository</h1>
        <p className="text-gray-600">
          Browse all documents that power our AI-generated answers
        </p>
      </div>
      
      <Suspense fallback={<DocumentListSkeleton />}>
        <DocumentList />
      </Suspense>
    </div>
  )
}
