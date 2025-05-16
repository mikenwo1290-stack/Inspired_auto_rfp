"use client";

import React, { Suspense, useEffect } from "react";
import { HomeContent } from "@/components/projects/HomeContent";
import { PageSkeleton } from "@/components/projects/PageSkeleton";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Check if there are organizations and redirect to the first one
    const checkOrganizations = async () => {
      try {
        const response = await fetch("/api/organizations");
        if (response.ok) {
          const organizations = await response.json();
          if (organizations.length > 0) {
            router.push(`/org/${organizations[0].id}`);
          }
        }
      } catch (error) {
        console.error("Error checking organizations:", error);
      }
    };

    checkOrganizations();
  }, [router]);

  return (
    <Suspense fallback={<PageSkeleton />}>
      <HomeContent />
    </Suspense>
  );
}
