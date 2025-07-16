"use client"

import React, { useState, useEffect, Suspense, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { AlertCircle } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { RfpDocument, AnswerSource } from "@/types/api"
import { useMultiStepResponse } from "@/hooks/use-multi-step-response"
import { MultiStepResponseDialog } from "@/components/ui/multi-step-response-dialog"

// Import the new components
// import { IndexSelector } from "./index-selector"
import { QuestionsHeader } from "./questions-header"
import { NoQuestionsAvailable } from "./no-questions-available"
import { SourceDetailsDialog } from "./source-details-dialog"
import { QuestionsTabsContent } from "./questions-tabs-content"

// Interfaces
interface AnswerData {
  text: string;
  sources?: AnswerSource[];
}

interface ProjectIndex {
  id: string;
  name: string;
}

interface QuestionWithSection {
  id: string;
  question: string;
  sectionTitle: string;
  sectionId: string;
}

interface QuestionsSectionProps {
  projectId: string;
}


// Inner component that uses search params
function QuestionsSectionInner({ projectId }: QuestionsSectionProps) {
  
  // UI state
  const [showAIPanel, setShowAIPanel] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  
  // Data state
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rfpDocument, setRfpDocument] = useState<RfpDocument | null>(null)
  const [project, setProject] = useState<any>(null)
  const [answers, setAnswers] = useState<Record<string, AnswerData>>({})
  const [unsavedQuestions, setUnsavedQuestions] = useState<Set<string>>(new Set())
  
  // Process state
  const [savingQuestions, setSavingQuestions] = useState<Set<string>>(new Set())
  const [lastSaved, setLastSaved] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState<Record<string, boolean>>({})
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSource, setSelectedSource] = useState<AnswerSource | null>(null)
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false)
  const [selectedIndexes, setSelectedIndexes] = useState<Set<string>>(new Set())
  const [availableIndexes, setAvailableIndexes] = useState<ProjectIndex[]>([])
  const [isLoadingIndexes, setIsLoadingIndexes] = useState(false)
  const [organizationConnected, setOrganizationConnected] = useState(false)

  // Multi-step response state
  const [useMultiStep, setUseMultiStep] = useState(false)
  const [multiStepDialogOpen, setMultiStepDialogOpen] = useState(false)
  const [currentQuestionForMultiStep, setCurrentQuestionForMultiStep] = useState<string | null>(null)
  const [currentQuestionText, setCurrentQuestionText] = useState<string>("")
  
  // Use the new streaming multi-step response hook
  const {
    generateResponse: generateMultiStepResponse,
    isGenerating: isMultiStepGenerating,
    currentSteps: multiStepSteps,
    finalResponse: multiStepFinalResponse,
    sources: multiStepSources,
    reset: resetMultiStepResponse 
  } = useMultiStepResponse({
    projectId: projectId || "",
    indexIds: Array.from(selectedIndexes),
    onComplete: (finalResponse, steps, sources) => {
      handleAcceptMultiStepResponse(finalResponse, sources);
    }
  })

  // Load project data and questions when component mounts
  useEffect(() => {
    if (!projectId) {
      setError("No project ID provided");
      setIsLoading(false);
      return;
    }

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

    const fetchIndexes = async () => {
      setIsLoadingIndexes(true);
      try {
        const response = await fetch(`/api/projects/${projectId}/indexes`);
        if (response.ok) {
          const data = await response.json();
          setOrganizationConnected(data.organizationConnected);
          if (data.organizationConnected) {
            const indexes = data.availableIndexes || [] as ProjectIndex[];
            setAvailableIndexes(indexes);
            
            const currentIndexes = data.currentIndexes || [] as ProjectIndex[];
            const currentIndexIds = new Set(currentIndexes.map((index: ProjectIndex) => index.id)) as Set<string>;
            setSelectedIndexes(currentIndexIds);
          }
        } else {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          console.error("Error response from indexes API:", errorData);
          
          if (errorData.error?.includes('Invalid index IDs')) {
            setSelectedIndexes(new Set());
            toast({
              title: "Index Sync Issue",
              description: "Some project indexes are out of sync. Please reconfigure your document indexes in project settings.",
              variant: "destructive",
            });
          }
          
          setOrganizationConnected(true);
          setAvailableIndexes([]);
        }
      } catch (error) {
        console.error("Error loading indexes:", error);
        setOrganizationConnected(false);
        setAvailableIndexes([]);
        setSelectedIndexes(new Set());
      } finally {
        setIsLoadingIndexes(false);
      }
    };

    const fetchQuestions = async () => {
      try {
        const response = await fetch(`/api/questions/${projectId}`);
        
        if (!response.ok) {
          throw new Error("Failed to load questions");
        }
        
        const data = await response.json();
        setRfpDocument(data);

        const answersResponse = await fetch(`/api/questions/${projectId}/answers`);
        if (answersResponse.ok) {
          const savedAnswers = await answersResponse.json();
          
          const normalizedAnswers: Record<string, AnswerData> = {};
          for (const [questionId, answerData] of Object.entries(savedAnswers)) {
            if (typeof answerData === 'string') {
              normalizedAnswers[questionId] = { text: answerData };
            } else {
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

    Promise.all([fetchProject(), fetchIndexes(), fetchQuestions()]).catch(error => {
      console.error("Error in parallel loading:", error);
    });
  }, [projectId]);

  // Handle index selection
  const handleIndexToggle = (indexId: string) => {
    setSelectedIndexes(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(indexId)) {
        newSelected.delete(indexId);
      } else {
        newSelected.add(indexId);
      }
      return newSelected;
    });
  };

  // Toggle all indexes
  const handleSelectAllIndexes = () => {
    if (selectedIndexes.size === availableIndexes.length) {
      setSelectedIndexes(new Set());
    } else {
      setSelectedIndexes(new Set(availableIndexes.map(index => index.id)));
    }
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

    setUnsavedQuestions(prev => {
      const updated = new Set(prev);
      updated.add(questionId);
      return updated;
    });
  };

  // Modified generate answer handler to support multi-step
  const handleGenerateAnswer = async (questionId: string) => {
    const question = rfpDocument?.sections.flatMap(s => s.questions).find(q => q.id === questionId);
    
    if (!question) {
      toast({
        title: "Error",
        description: "Question not found",
        variant: "destructive",
      });
      return;
    }

    if (useMultiStep) {
      setCurrentQuestionForMultiStep(questionId);
      setCurrentQuestionText(question.question);
      setMultiStepDialogOpen(true);
      resetMultiStepResponse();
      
      if (!projectId) {
        toast({
          title: "Error",
          description: "Project ID not available",
          variant: "destructive",
        });
        return;
      }
      
      await generateMultiStepResponse(question.question);
    } else {
      setIsGenerating(prev => ({ ...prev, [questionId]: true }));
      
      try {
        const response = await fetch('/api/generate-response', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            question: question.question,
            documentIds: project?.documentIds || [],
            selectedIndexIds: Array.from(selectedIndexes),
            useAllIndexes: false,
            projectId: project?.id
          }),
        });
        
        if (!response.ok) {
          throw new Error("Failed to generate answer");
        }
        
        const result = await response.json();
        
        setAnswers(prev => ({
          ...prev,
          [questionId]: {
            text: result.response,
            sources: result.sources
          }
        }));

        setUnsavedQuestions(prev => {
          const updated = new Set(prev);
          updated.add(questionId);
          return updated;
        });
        
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
    }
  };

  // Handler for accepting multi-step response
  const handleAcceptMultiStepResponse = (response: string, sources: any[]) => {
    if (currentQuestionForMultiStep) {
      setAnswers(prev => ({
        ...prev,
        [currentQuestionForMultiStep]: {
          text: response,
          sources: sources
        }
      }));

      setUnsavedQuestions(prev => {
        const updated = new Set(prev);
        updated.add(currentQuestionForMultiStep);
        return updated;
      });
      
      toast({
        title: "Multi-Step Answer Generated",
        description: "AI-generated answer with step-by-step reasoning has been created. Please review and save it.",
      });
    }
  };

  const handleCloseMultiStepDialog = () => {
    setMultiStepDialogOpen(false);
    setCurrentQuestionForMultiStep(null);
    resetMultiStepResponse();
  };

  // Save a single answer
  const saveAnswer = async (questionId: string) => {
    if (!projectId || !answers[questionId]) return;

    setSavingQuestions(prev => {
      const updated = new Set(prev);
      updated.add(questionId);
      return updated;
    });
    
    try {
      const response = await fetch(`/api/questions/${projectId}/answers/${questionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(answers[questionId]),
      });
      
      if (response.ok) {
        setUnsavedQuestions(prev => {
          const updated = new Set(prev);
          updated.delete(questionId);
          return updated;
        });
        
        const result = await response.json();
        setLastSaved(result.timestamp);
        
        toast({
          title: "Answer Saved",
          description: "Your answer has been saved successfully.",
        });
      } else {
        throw new Error(`Failed to save answer: ${response.statusText}`);
      }
    } catch (error) {
      console.error(`Error saving answer for question ${questionId}:`, error);
      toast({
        title: "Save Error",
        description: "Failed to save your answer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSavingQuestions(prev => {
        const updated = new Set(prev);
        updated.delete(questionId);
        return updated;
      });
    }
  };

  // Save all unsaved answers
  const saveAllAnswers = async () => {
    if (!projectId || unsavedQuestions.size === 0) return;
    
    const answersToSave: Record<string, AnswerData> = {};
    unsavedQuestions.forEach(questionId => {
      if (answers[questionId]) {
        answersToSave[questionId] = answers[questionId];
      }
    });

    setSavingQuestions(new Set(unsavedQuestions));
    
    try {
      const response = await fetch(`/api/questions/${projectId}/answers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(answersToSave),
      });
      
      if (response.ok) {
        setUnsavedQuestions(new Set());
        
        const result = await response.json();
        setLastSaved(result.timestamp);
        
        toast({
          title: "All Answers Saved",
          description: `Successfully saved ${Object.keys(answersToSave).length} answers.`,
        });
      } else {
        throw new Error(`Failed to save answers: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error saving all answers:', error);
      toast({
        title: "Save Error",
        description: "Failed to save your answers. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSavingQuestions(new Set());
    }
  };

  // Export answers as CSV
  const handleExportAnswers = () => {
    if (!rfpDocument) return;

    const rows = [
      ['Section', 'Question', 'Answer'], // Header row
    ];

    rfpDocument.sections.forEach(section => {
      section.questions.forEach(question => {
        rows.push([
          section.title,
          question.question,
          answers[question.id]?.text || ''
        ]);
      });
    });

    const csvContent = rows.map(row => 
      row.map(cell => 
        typeof cell === 'string' ? `"${cell.replace(/"/g, '""')}"` : cell
      ).join(',')
    ).join('\n');

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

  // Handle marking a question as complete
  const handleMarkComplete = (questionId: string) => {
    saveAnswer(questionId).then(() => {
      toast({
        title: "Question Completed",
        description: "This question has been marked as complete.",
      });
    });
  };

  // Get the currently selected question data
  const getSelectedQuestionData = () => {
    if (!selectedQuestion || !rfpDocument) return null;
    
    for (const section of rfpDocument.sections) {
      const question = section.questions.find(q => q.id === selectedQuestion);
      if (question) {
        return {
          question,
          section
        };
      }
    }
    return null;
  };

  // Filter questions based on the search query and filter type
  const getFilteredQuestions = (filterType = "all") => {
    if (!rfpDocument) return [];
    
    const allQuestions = rfpDocument.sections.flatMap(section => {
      return section.questions.map(question => ({
        ...question,
        sectionTitle: section.title,
        sectionId: section.id
      }));
    });
    
    let statusFiltered = allQuestions;
    
    if (filterType === "answered") {
      statusFiltered = allQuestions.filter(q => 
        answers[q.id]?.text && answers[q.id].text.trim() !== ''
      );
    } else if (filterType === "unanswered") {
      statusFiltered = allQuestions.filter(q => 
        !answers[q.id]?.text || answers[q.id].text.trim() === ''
      );
    } else if (filterType === "flagged") {
      statusFiltered = allQuestions.filter(q => {
        const answer = answers[q.id]?.text || "";
        return answer && (
          answer.toLowerCase().includes("review") || 
          answer.toLowerCase().includes("incomplete") || 
          answer.toLowerCase().includes("todo")
        );
      });
    }
    
    if (!searchQuery) return statusFiltered;
    
    const query = searchQuery.toLowerCase();
    return statusFiltered.filter(q => 
      q.question.toLowerCase().includes(query) || 
      q.sectionTitle.toLowerCase().includes(query)
    );
  };

  // Count questions by status
  const getCounts = () => {
    if (!rfpDocument) return { all: 0, answered: 0, unanswered: 0, flagged: 0 };
    
    const allQuestions = rfpDocument.sections.flatMap(s => s.questions);
    const answeredCount = allQuestions.filter(q => answers[q.id]?.text && answers[q.id].text.trim() !== '').length;
    const needsReviewCount = allQuestions.filter(q => {
      const answer = answers[q.id]?.text || "";
      return answer && (
        answer.toLowerCase().includes("review") || 
        answer.toLowerCase().includes("incomplete") || 
        answer.toLowerCase().includes("todo")
      );
    }).length;
    
    return {
      all: allQuestions.length,
      answered: answeredCount,
      unanswered: allQuestions.length - answeredCount,
      flagged: needsReviewCount
    };
  };

  // Handle source click to open the modal
  const handleSourceClick = (source: AnswerSource) => {
    setSelectedSource(source);
    setIsSourceModalOpen(true);
  };

  // If still loading, show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="text-center">
          <Spinner size="lg" className="mb-4" />
          <p>Loading questions...</p>
        </div>
      </div>
    );
  }

  // If there was an error, show error state
  if (error) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium">Error Loading Questions</h3>
        <p className="text-muted-foreground mt-2">{error}</p>
      </div>
    );
  }

  // Check if there are no questions and show the NoQuestionsAvailable component
  if (!rfpDocument || rfpDocument.sections.length === 0 || 
      rfpDocument.sections.every(section => section.questions.length === 0)) {
    return (
      <>
        {projectId && <NoQuestionsAvailable projectId={projectId} />}
      </>
    );
  }

  const questionData = getSelectedQuestionData();
  const counts = getCounts();

  return (
    <div className="space-y-6 p-12">
      <QuestionsHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSaveAll={saveAllAnswers}
        onExport={handleExportAnswers}
        unsavedCount={unsavedQuestions.size}
        isSaving={savingQuestions.size > 0}
      />

      {/* Index Selection Panel */}
      {/* <IndexSelector
        availableIndexes={availableIndexes}
        selectedIndexes={selectedIndexes}
        organizationConnected={organizationConnected}
        onIndexToggle={handleIndexToggle}
        onSelectAllIndexes={handleSelectAllIndexes}
      /> */}

      <SourceDetailsDialog
        isOpen={isSourceModalOpen}
        onClose={() => setIsSourceModalOpen(false)}
        source={selectedSource}
      />

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 mb-4">
          <TabsTrigger value="all" className="gap-1">
            All Questions
            <Badge variant="secondary" className="ml-1">{counts.all}</Badge>
          </TabsTrigger>
          <TabsTrigger value="answered" className="gap-1">
            Answered
            <Badge variant="secondary" className="ml-1">{counts.answered}</Badge>
          </TabsTrigger>
          <TabsTrigger value="unanswered" className="gap-1">
            Unanswered
            <Badge variant="secondary" className="ml-1">{counts.unanswered}</Badge>
          </TabsTrigger>
          <TabsTrigger value="flagged" className="gap-1">
            Needs Review
            <Badge variant="secondary" className="ml-1">{counts.flagged}</Badge>
          </TabsTrigger>
        </TabsList>

        {["all", "answered", "unanswered", "flagged"].map(filterType => (
          <TabsContent key={filterType} value={filterType} className="space-y-4">
            <QuestionsTabsContent
              questions={getFilteredQuestions(filterType)}
              selectedQuestion={selectedQuestion}
              questionData={questionData}
              answers={answers}
              unsavedQuestions={unsavedQuestions}
              selectedIndexes={selectedIndexes}
              isGenerating={isGenerating}
              isMultiStepGenerating={isMultiStepGenerating}
              savingQuestions={savingQuestions}
              useMultiStep={useMultiStep}
              showAIPanel={showAIPanel}
              filterType={filterType}
              onSelectQuestion={(id) => {
                setSelectedQuestion(id);
                setShowAIPanel(false);
              }}
              onAnswerChange={handleAnswerChange}
              onSave={saveAnswer}
              onMarkComplete={handleMarkComplete}
              onGenerateAnswer={handleGenerateAnswer}
              onSourceClick={handleSourceClick}
              onMultiStepToggle={setUseMultiStep}
              rfpDocument={rfpDocument}
              searchQuery={searchQuery}
            />
          </TabsContent>
        ))}
      </Tabs>
      
      {/* Multi-step response dialog */}
      <MultiStepResponseDialog
        isOpen={multiStepDialogOpen}
        onClose={handleCloseMultiStepDialog}
        questionText={currentQuestionText}
        isGenerating={isMultiStepGenerating}
        currentSteps={multiStepSteps}
        finalResponse={multiStepFinalResponse}
        sources={multiStepSources}
        onAcceptResponse={handleAcceptMultiStepResponse}
      />
      
      <Toaster />
    </div>
  )
}

// Main export that wraps the inner component with Suspense
export function QuestionsSection({ projectId }: QuestionsSectionProps) {
  return (
    <Suspense fallback={
      <div className="space-y-6 p-12">
        <div className="flex items-center justify-between">
          <div className="h-8 w-36 bg-muted animate-pulse rounded"></div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-64 bg-muted animate-pulse rounded"></div>
            <div className="h-9 w-24 bg-muted animate-pulse rounded"></div>
            <div className="h-9 w-32 bg-muted animate-pulse rounded"></div>
          </div>
        </div>
        <div className="h-12 bg-muted animate-pulse rounded"></div>
        <div className="h-[500px] bg-muted animate-pulse rounded"></div>
      </div>
    }>
      <QuestionsSectionInner projectId={projectId} />
    </Suspense>
  )
} 