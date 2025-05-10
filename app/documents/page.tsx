import { Suspense } from 'react'
import DocumentList from './components/DocumentList'
import DocumentListSkeleton from './components/DocumentListSkeleton'

export const metadata = {
  title: 'Document Repository',
  description: 'View all documents powering our AI-generated answers',
}

export default async function DocumentsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
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
