"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { RfpDocument, RfpSection } from "@/types/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

// Create a client component that uses useSearchParams
function QuestionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rfpDocument, setRfpDocument] = useState<RfpDocument | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [project, setProject] = useState<any>(null);

  useEffect(() => {
    if (!projectId) {
      setError("No project ID provided");
      setIsLoading(false);
      return;
    }

    // Fetch the project details
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}`);
        if (!response.ok) {
          throw new Error("Failed to load project");
        }
        const data = await response.json();
        setProject(data);
      } catch (error) {
        console.error("Error loading project:", error);
        setError("Failed to load project. Please try again.");
        setIsLoading(false);
      }
    };

    // Fetch the extracted questions for this project
    const fetchQuestions = async () => {
      try {
        const response = await fetch(`/api/questions/${projectId}`);
        
        if (!response.ok) {
          throw new Error("Failed to load questions");
        }
        
        const data = await response.json();
        setRfpDocument(data);

        // Also fetch any saved answers
        const answersResponse = await fetch(`/api/questions/${projectId}/answers`);
        if (answersResponse.ok) {
          const savedAnswers = await answersResponse.json();
          setAnswers(savedAnswers);
        }
      } catch (error) {
        console.error("Error loading questions:", error);
        setError("Failed to load questions. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    // Fetch both project and questions
    Promise.all([fetchProject(), fetchQuestions()]).catch(error => {
      console.error("Error in parallel loading:", error);
    });
  }, [projectId]);

  // Auto-save answers when they change
  useEffect(() => {
    if (!projectId || !rfpDocument || Object.keys(answers).length === 0) return;
    
    const saveTimeout = setTimeout(async () => {
      try {
        setIsSaving(true);
        const response = await fetch(`/api/questions/${projectId}/answers`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(answers),
        });
        
        if (response.ok) {
          const result = await response.json();
          setLastSaved(result.timestamp);
          console.log('Answers saved successfully');
        } else {
          console.error('Failed to save answers');
        }
      } catch (error) {
        console.error('Error saving answers:', error);
        toast({
          title: "Save Error",
          description: "Failed to save your answers. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsSaving(false);
      }
    }, 2000); // Save after 2 seconds of inactivity
    
    return () => clearTimeout(saveTimeout);
  }, [answers, projectId, rfpDocument]);

  // Handle section selection
  const handleSectionClick = (sectionId: string) => {
    setActiveSection(activeSection === sectionId ? null : sectionId);
  };

  // Handle answer changes
  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  // Export answers as CSV
  const handleExportAnswers = () => {
    if (!rfpDocument) return;

    const rows = [
      ['Section', 'Question', 'Answer'], // Header row
    ];

    // Add data rows
    rfpDocument.sections.forEach(section => {
      section.questions.forEach(question => {
        rows.push([
          section.title,
          question.question,
          answers[question.id] || '' // Get answer from our state
        ]);
      });
    });

    // Convert to CSV
    const csvContent = rows.map(row => 
      row.map(cell => 
        typeof cell === 'string' ? `"${cell.replace(/"/g, '""')}"` : cell
      ).join(',')
    ).join('\n');

    // Create blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${rfpDocument.documentName} - Answers.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="border-b bg-white">
          <div className="container flex h-16 p-4 items-center">
            <Link href="/" className="font-bold text-xl">
              AutoRFP
            </Link>
          </div>
        </header>
        <main className="flex-1 bg-slate-50 flex items-center justify-center">
          <div className="text-center">
            <Spinner size="lg" className="mb-4" />
            <p className="text-lg">Loading questions...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !rfpDocument) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="border-b bg-white">
          <div className="container flex h-16 p-4 items-center">
            <Link href="/" className="font-bold text-xl">
              AutoRFP
            </Link>
          </div>
        </header>
        <main className="flex-1 bg-slate-50 flex items-center justify-center">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle className="text-red-500">Error Loading Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{error || "Failed to load document questions."}</p>
              <Button className="mt-4" onClick={() => router.push("/")}>
                Back to Projects
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
        <div className="container flex h-16 p-4 items-center">
          <Link href="/" className="font-bold text-xl">
            AutoRFP
          </Link>
        </div>
      </header>

      <main className="flex-1 bg-slate-50">
        <div className="container py-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <Button 
                variant="outline" 
                onClick={() => router.push(`/upload?projectId=${projectId}`)}
                className="mb-2"
              >
                ← Back to Files
              </Button>
              <h1 className="text-3xl font-bold">{rfpDocument.documentName}</h1>
              {project && project.description && (
                <p className="text-muted-foreground mb-2">{project.description}</p>
              )}
              <p className="text-muted-foreground">
                {rfpDocument.sections.length} sections • {rfpDocument.sections.reduce((count, section) => count + section.questions.length, 0)} questions
              </p>
            </div>
            <div className="flex items-center gap-4">
              {isSaving ? (
                <div className="text-sm text-muted-foreground flex items-center">
                  <Spinner size="sm" className="mr-2" />
                  Saving...
                </div>
              ) : lastSaved ? (
                <div className="text-sm text-muted-foreground">
                  Last saved: {new Date(lastSaved).toLocaleTimeString()}
                </div>
              ) : null}
              <Button 
                className="bg-green-600 hover:bg-green-700"
                onClick={handleExportAnswers}
              >
                Export Answers
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Sections navigation sidebar */}
            <div className="col-span-1 bg-white rounded-lg border p-4 h-min sticky top-8">
              <h2 className="text-lg font-semibold mb-4">Sections</h2>
              <nav className="space-y-1">
                {rfpDocument.sections.map((section) => (
                  <button
                    key={section.id}
                    className={`
                      w-full text-left px-3 py-2 text-sm rounded-md transition-colors
                      ${activeSection === section.id ? 'bg-slate-100 text-slate-900 font-medium' : 'text-slate-600 hover:bg-slate-50'}
                    `}
                    onClick={() => handleSectionClick(section.id)}
                  >
                    {section.title}
                    <span className="ml-2 text-xs text-slate-400">
                      ({section.questions.length})
                    </span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Questions and answers main content */}
            <div className="col-span-2">
              <div className="space-y-6">
                {rfpDocument.sections.map((section) => (
                  <Accordion
                    key={section.id}
                    type="single"
                    collapsible
                    defaultValue={activeSection === section.id ? section.id : undefined}
                    value={activeSection === section.id ? section.id : undefined}
                    onValueChange={(value) => {
                      setActiveSection(value || null);
                    }}
                  >
                    <AccordionItem value={section.id} className="bg-white rounded-lg border">
                      <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-slate-50">
                        <div className="text-left">
                          <h3 className="text-md font-medium">{section.title}</h3>
                          {section.description && (
                            <p className="text-sm text-slate-500 mt-1">{section.description}</p>
                          )}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-4">
                        <div className="space-y-4">
                          {section.questions.map((question) => (
                            <div key={question.id} className="border-t pt-4 first:border-t-0 first:pt-0">
                              <label htmlFor={question.id} className="block text-sm font-medium mb-2">
                                {question.question}
                              </label>
                              <textarea
                                id={question.id}
                                rows={4}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={answers[question.id] || ''}
                                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                placeholder="Type your answer here..."
                              />
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
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
      <QuestionsContent />
      <Toaster />
    </Suspense>
  );
} 