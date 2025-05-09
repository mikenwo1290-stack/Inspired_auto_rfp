import React from "react";
import Link from "next/link";

interface PageLayoutProps {
  children: React.ReactNode;
}

export function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen w-full">
      {/* We don't need a header anymore as the sidebar has project info */}
      <main className="flex-1 bg-slate-50 p-6">
        {children}
      </main>
    </div>
  );
} 