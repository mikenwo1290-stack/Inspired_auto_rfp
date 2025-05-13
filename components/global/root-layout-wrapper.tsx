"use client"

import React, { useState, Suspense } from 'react'
import { GlobalSidebar } from './sidebar'
import { HomeSidebar } from './home-sidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { PanelLeftIcon } from 'lucide-react'
import { useSearchParams, usePathname } from 'next/navigation'

// Create a separate client component that uses useSearchParams
function SidebarController({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const projectId = searchParams.get("projectId")
  const isHomePage = pathname === '/'
  
  return (
    <SidebarProvider 
      defaultOpen={true} 
      open={sidebarOpen}
      onOpenChange={setSidebarOpen}
    >
      <div className="flex w-full min-h-screen">
        <div className="flex-shrink-0">
          {isHomePage ? <HomeSidebar /> : <GlobalSidebar />}
        </div>
        <div className="flex-1 overflow-auto pl-6">
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
        <div className="w-64 border-r bg-muted/20 animate-pulse"></div>
        <div className="flex-1 overflow-auto pl-6">
          <div className="animate-pulse space-y-4 p-6">
            <div className="h-8 w-64 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    }>
      <SidebarController>
        {children}
      </SidebarController>
    </Suspense>
  )
} 