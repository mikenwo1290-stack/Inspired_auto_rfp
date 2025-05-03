"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/toaster";
import { Skeleton } from "@/components/ui/skeleton";

interface Question {
  id: string;
  text: string;
  section?: string;
  category?: string;
}

// Create a client component that uses useSearchParams
function QuestionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const documentId = searchParams.get("documentId");
  
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [documentName, setDocumentName] = useState<string>("");
  
  // Simulated questions - in a real app, fetch these from the API based on documentId
  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      const sampleQuestions: Question[] = [
        { id: "q1", text: "What is your experience in similar projects?", section: "Experience" },
        { id: "q2", text: "Describe your development methodology.", section: "Methodology" },
        { id: "q3", text: "What is your typical project timeline?", section: "Timeline" },
        { id: "q4", text: "How do you handle testing and quality assurance?", section: "Quality" },
        { id: "q5", text: "What technologies do you specialize in?", section: "Technology" },
        { id: "q6", text: "Provide details about your team structure.", section: "Team" },
        { id: "q7", text: "Describe your support and maintenance options.", section: "Support" },
        { id: "q8", text: "What are your pricing models?", section: "Pricing" },
      ];
      
      setQuestions(sampleQuestions);
      setDocumentName("Software Development RFP.xlsx");
      setLoading(false);
    }, 1000);
  }, [documentId]);
  
  if (!documentId) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="border-b bg-white">
          <div className="container flex h-16 items-center">
            <Link href="/" className="font-bold text-xl">AutoRFP</Link>
          </div>
        </header>
        
        <main className="flex-1 bg-slate-50 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Missing Document ID</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">No document ID was provided. Please upload a document first.</p>
              <Button asChild>
                <Link href="/upload">Go to Upload</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b bg-white">
        <div className="container flex h-16 items-center">
          <Link href="/" className="font-bold text-xl">
            AutoRFP
          </Link>
          <div className="ml-auto">
            <Button variant="outline" asChild className="mr-2">
              <Link href="/upload">Upload New Document</Link>
            </Button>
            <Button>Export Questions</Button>
          </div>
        </div>
      </header>

      <main className="flex-1 bg-slate-50">
        <div className="container py-8">
          <div className="mb-8">
            <Link href="/upload" className="text-sm text-blue-600 mb-2 inline-block">
              ← Back to Upload
            </Link>
            {loading ? (
              <Skeleton className="h-8 w-1/3" />
            ) : (
              <h1 className="text-2xl font-semibold">{documentName}</h1>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Extracted Questions</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                </div>
              ) : (
                <div className="space-y-4">
                  {questions.map((question) => (
                    <div key={question.id} className="p-4 border rounded-md bg-white">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{question.text}</p>
                          {question.section && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Section: {question.section}
                            </p>
                          )}
                        </div>
                        <Button size="sm" variant="outline">Edit</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Toaster />
    </div>
  );
}

// Loading fallback for Suspense
function QuestionsLoading() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b bg-white">
        <div className="container flex h-16 items-center">
          <Link href="/" className="font-bold text-xl">AutoRFP</Link>
        </div>
      </header>
      
      <main className="flex-1 bg-slate-50">
        <div className="container py-8">
          <div className="mb-8">
            <Skeleton className="h-8 w-1/3" />
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Loading Questions...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

// Main page component with Suspense boundary
export default function QuestionsPage() {
  return (
    <Suspense fallback={<QuestionsLoading />}>
      <QuestionsContent />
    </Suspense>
  );
} 