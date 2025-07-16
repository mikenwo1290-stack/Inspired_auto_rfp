"use client"

import { useState } from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { ProjectLayout } from "./project-layout"
import { ProjectContent } from "./project-content"

export function RFPProjectPage() {
  // Control sidebar state at this level to avoid re-renders causing toggle issues
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <SidebarProvider 
      defaultOpen={true}
      open={sidebarOpen}
      onOpenChange={setSidebarOpen}
    >
      <ProjectLayout>
        <ProjectContent />
      </ProjectLayout>
    </SidebarProvider>
  )
}
