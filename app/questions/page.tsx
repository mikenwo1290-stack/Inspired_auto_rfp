"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { RfpDocument, AnswerSource } from "@/types/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { QuestionsSection } from "./components/questions-section";

// Interface for answer data
interface AnswerData {
  text: string;
  sources?: AnswerSource[];
}


function QuestionsLoadingFallback() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b bg-white">
        <div className="container flex h-16 p-4 items-center">
          <div className="font-bold text-xl">AutoRFP</div>
        </div>
      </header>
      <main className="flex-1 bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" className="mb-4" />
          <p className="text-lg">Loading...</p>
        </div>
      </main> 
    </div>
  );
}

export default function QuestionsPage() {
  return (
    
      <Suspense fallback={<QuestionsLoadingFallback />}>
        <QuestionsSection />
        <Toaster />
      </Suspense>
    
  );
}