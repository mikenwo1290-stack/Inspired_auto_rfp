'use client';

import { ThemeProvider } from "next-themes";
import { ReactNode } from "react";
import { OrganizationProvider } from "@/context/organization-context";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <OrganizationProvider>
        {children}
      </OrganizationProvider>
    </ThemeProvider>
  );
} 