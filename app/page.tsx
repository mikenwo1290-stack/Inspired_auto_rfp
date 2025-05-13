"use client";

import React, { Suspense } from "react";
import { HomeContent } from "@/components/projects/HomeContent";
import { PageSkeleton } from "@/components/projects/PageSkeleton";

export default function HomePage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <HomeContent />
    </Suspense>
  );
}
