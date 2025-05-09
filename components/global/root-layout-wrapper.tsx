"use client"

import React, { useState, Suspense } from 'react'
import { GlobalSidebar } from './sidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { PanelLeftIcon } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

// Create a separate client component that uses useSearchParams
function SidebarController({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const searchParams = useSearchParams()
  const projectId = searchParams.get("projectId")
  
  return (
    <SidebarProvider 
      defaultOpen={true} 
      open={sidebarOpen}
      onOpenChange={setSidebarOpen}
    >
      <div className="flex min-h-screen">
        <div className='mr-12'>
          <GlobalSidebar />
        </div>
        <div className="flex-1 overflow-auto p-12">
          {children}
        </div>
        
        {/* Floating toggle button that appears only when sidebar is closed */}
        {!sidebarOpen && (
          <Button
            variant="outline"
            size="icon"
            className="fixed left-4 top-4 z-50 rounded-full shadow-md bg-white"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <PanelLeftIcon className="h-4 w-4" />
          </Button>
        )}
      </div>
    </SidebarProvider>
  )
}

export default function RootLayoutWrapper({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen">
        <div className="flex-1 overflow-auto p-12">
          <div className="animate-pulse">Loading...</div>
        </div>
      </div>
    }>
      <SidebarController>
        {children}
      </SidebarController>
    </Suspense>
  )
} 