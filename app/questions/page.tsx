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
import { SectionItem } from "./components/SectionItem";

// Interface for answer data
interface AnswerData {
  text: string;
  sources?: AnswerSource[];
}

// Create a client component that uses useSearchParams
function QuestionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rfpDocument, setRfpDocument] = useState<RfpDocument | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, AnswerData>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [project, setProject] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState<Record<string, boolean>>({});
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);

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
          
          // Normalize answers to new format
          const normalizedAnswers: Record<string, AnswerData> = {};
          for (const [questionId, answerData] of Object.entries(savedAnswers)) {
            if (typeof answerData === 'string') {
              // Convert legacy string format to object format
              normalizedAnswers[questionId] = { text: answerData };
            } else {
              // Already in object format
              normalizedAnswers[questionId] = answerData as AnswerData;
            }
          }
          
          setAnswers(normalizedAnswers);
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
    setAnswers(prev => {
      const existing = prev[questionId] || { text: '' };
      return {
        ...prev,
        [questionId]: {
          ...existing,
          text: value
        }
      };
    });
  };

  // Handle answer generation
  const handleGenerateAnswer = async (questionId: string) => {
    setIsGenerating(prev => ({ ...prev, [questionId]: true }));
    
    try {
      const question = rfpDocument?.sections.flatMap(s => s.questions).find(q => q.id === questionId);
      
      if (!question) {
        throw new Error("Question not found");
      }
      
      // Call the API to generate a response
      const response = await fetch('/api/generate-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: question.question,
          documentIds: project?.documentIds || []
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to generate answer");
      }
      
      const result = await response.json();
      
      // Update the answer with the generated response and sources
      setAnswers(prev => ({
        ...prev,
        [questionId]: {
          text: result.response,
          sources: result.sources
        }
      }));
      
      // Show toast notification for successful generation
      toast({
        title: "Answer Generated",
        description: "AI-generated answer has been created. Please review and save it.",
      });
    } catch (error) {
      console.error('Error generating answer:', error);
      toast({
        title: "Generation Error",
        description: "Failed to generate answer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(prev => ({ ...prev, [questionId]: false }));
    }
  };

  // Handle generating answers for all questions
  const handleGenerateAllAnswers = async () => {
    if (isGeneratingAll) return;
    
    setIsGeneratingAll(true);
    
    try {
      // Get all question IDs
      const allQuestions = rfpDocument?.sections.flatMap(section => section.questions) || [];
      
      for (const question of allQuestions) {
        // Skip questions that already have answers
        if (answers[question.id]?.text && answers[question.id].text.trim() !== '') {
          continue;
        }
        
        setIsGenerating(prev => ({ ...prev, [question.id]: true }));
        
        try {
          // Generate answer for each question
          const response = await fetch('/api/generate-response', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              question: question.question,
              documentIds: project?.documentIds || []
            }),
          });
          
          if (!response.ok) {
            throw new Error("Failed to generate answer");
          }
          
          const result = await response.json();
          
          // Update the answer with the generated response and sources
          setAnswers(prev => ({
            ...prev,
            [question.id]: {
              text: result.response,
              sources: result.sources
            }
          }));
          
          // Small delay between questions to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`Error generating answer for question ${question.id}:`, error);
        } finally {
          setIsGenerating(prev => ({ ...prev, [question.id]: false }));
        }
      }
      
      toast({
        title: "All Answers Generated",
        description: `Generated answers for all questions. Please review and save them.`,
      });
    } catch (error) {
      console.error('Error generating all answers:', error);
      toast({
        title: "Generation Error",
        description: "Failed to generate all answers. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingAll(false);
    }
  };

  // Handle confirmation of an answer
  const handleConfirmAnswer = (questionId: string, answer: string, answerSources?: AnswerSource[]) => {
    // Update the answer in state with its sources
    setAnswers(prev => {
      const existing = prev[questionId] || { text: '' };
      return {
        ...prev,
        [questionId]: {
          ...existing,
          text: answer,
          sources: answerSources || existing.sources
        }
      };
    });
    
    // Show a toast notification
    toast({
      title: "Answer Confirmed",
      description: "Your answer has been saved.",
    });
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
          answers[question.id]?.text || '' // Get answer text from our state
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
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={handleGenerateAllAnswers}
                disabled={isGeneratingAll}
              >
                {isGeneratingAll ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Generating...
                  </>
                ) : (
                  <>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      className="mr-2 h-4 w-4"
                    >
                      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
                      <path d="M9 18h6" />
                      <path d="M10 22h4" />
                    </svg>
                    Generate All Answers
                  </>
                )}
              </Button>
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
                  <SectionItem
                    key={section.id}
                    section={section}
                    isActive={activeSection === section.id}
                    answers={answers}
                    isGenerating={isGenerating}
                    onToggle={(sectionId) => handleSectionClick(sectionId)}
                    onAnswerChange={handleAnswerChange}
                    onGenerateAnswer={handleGenerateAnswer}
                    onConfirmAnswer={handleConfirmAnswer}
                  />
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