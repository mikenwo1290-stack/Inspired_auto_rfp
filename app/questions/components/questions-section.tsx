"use client"

import React, { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, CheckCircle, Filter, Search, Sparkles, Download, Save } from "lucide-react"
import { QuestionNavigator } from "../../project/components/question-navigator"
import { AISuggestionsPanel } from "../../project/components/ai-suggestions-panel"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { RfpDocument, AnswerSource } from "@/types/api"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

// Interface for answer data
interface AnswerData {
  text: string;
  sources?: AnswerSource[];
}

// Inner component that uses search params
function QuestionsSectionInner() {
  const searchParams = useSearchParams()
  const projectId = searchParams.get("projectId")
  
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
  const [isGeneratingAll, setIsGeneratingAll] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSource, setSelectedSource] = useState<AnswerSource | null>(null)
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false)
  const [isTextTabActive, setIsTextTabActive] = useState(true)

  // Load project data and questions when component mounts
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

    // Mark this question as unsaved
    setUnsavedQuestions(prev => {
      const updated = new Set(prev);
      updated.add(questionId);
      return updated;
    });
  };

  // Save a single answer
  const saveAnswer = async (questionId: string) => {
    if (!projectId || !answers[questionId]) return;

    // Mark this question as saving
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
        // Remove from unsaved questions list
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
      // Remove from saving questions list
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
    
    // Create a subset of answers that need to be saved
    const answersToSave: Record<string, AnswerData> = {};
    unsavedQuestions.forEach(questionId => {
      if (answers[questionId]) {
        answersToSave[questionId] = answers[questionId];
      }
    });

    // Mark all unsaved questions as saving
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
        // Clear unsaved questions list
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
      // Clear saving questions list
      setSavingQuestions(new Set());
    }
  };

  // Handle answer generation for a single question
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

      // Mark this question as unsaved
      setUnsavedQuestions(prev => {
        const updated = new Set(prev);
        updated.add(questionId);
        return updated;
      });
      
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

          // Mark this question as unsaved
          setUnsavedQuestions(prev => {
            const updated = new Set(prev);
            updated.add(question.id);
            return updated;
          });
          
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

  // Handle saving a draft answer for the current question
  const handleSaveDraft = (questionId: string) => {
    saveAnswer(questionId);
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

  // Check if a question is currently being saved
  const isQuestionSaving = (questionId: string) => {
    return savingQuestions.has(questionId);
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
    
    // First get all questions
    const allQuestions = rfpDocument.sections.flatMap(section => {
      return section.questions.map(question => ({
        ...question,
        sectionTitle: section.title,
        sectionId: section.id
      }));
    });
    
    // Apply status filter
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
      // Define what makes a question "needs review" - for example, contains keywords
      statusFiltered = allQuestions.filter(q => {
        const answer = answers[q.id]?.text || "";
        return answer && (
          answer.toLowerCase().includes("review") || 
          answer.toLowerCase().includes("incomplete") || 
          answer.toLowerCase().includes("todo")
        );
      });
    }
    
    // Then apply search filter
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
    setIsTextTabActive(true);
  };

  // Source details dialog component
  const SourceDetailsDialog = () => (
    <Dialog open={isSourceModalOpen} onOpenChange={setIsSourceModalOpen}>
      <DialogContent className="sm:max-w-xl">
        <div className="flex justify-between items-center mb-2">
          <DialogTitle className="text-xl font-semibold">Source Information</DialogTitle>
        </div>
        <div className="text-sm text-gray-500 mb-4">Details about this source document</div>
        
        {selectedSource && (
          <div>
            {/* Tab Navigation */}
            <div className="flex border-b mb-4">
              <button
                className={`px-4 py-2 font-medium ${isTextTabActive ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setIsTextTabActive(true)}
              >
                Text Content
              </button>
              <button
                className={`px-4 py-2 font-medium ${!isTextTabActive ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setIsTextTabActive(false)}
              >
                Metadata
              </button>
            </div>
            
            {/* Text Content Tab */}
            {isTextTabActive ? (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">Text:</h3>
                  <div className="text-sm text-gray-500">
                    {selectedSource.fileName} {selectedSource.pageNumber ? `- Page ${selectedSource.pageNumber}` : ''}
                  </div>
                </div>
                
                {selectedSource.textContent ? (
                  <ScrollArea className="h-72 w-full border rounded-md">
                    <div className="whitespace-pre-wrap font-mono text-sm p-4 bg-gray-50">
                      {selectedSource.textContent}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="h-72 border rounded-md p-3 flex items-center justify-center text-gray-500 bg-gray-50">
                    No text content available for this source
                  </div>
                )}
              </div>
            ) : (
              /* Metadata Tab */
              <div className="space-y-4">
                <div className="flex flex-col space-y-1">
                  <span className="text-sm font-medium text-gray-500">File Name</span>
                  <span className="font-medium">{selectedSource.fileName}</span>
                </div>
                
                {selectedSource.pageNumber && (
                  <div className="flex flex-col space-y-1">
                    <span className="text-sm font-medium text-gray-500">Page Number</span>
                    <span>{selectedSource.pageNumber}</span>
                  </div>
                )}
                
                {selectedSource.relevance !== null && selectedSource.relevance !== undefined && (
                  <div className="flex flex-col space-y-1">
                    <span className="text-sm font-medium text-gray-500">Relevance</span>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${selectedSource.relevance}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500">{selectedSource.relevance}% match</span>
                  </div>
                )}
                
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-500 mb-2">
                    This source was used to generate the answer. You can view the full document in your project files.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );

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

  const questionData = getSelectedQuestionData();
  const counts = getCounts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">RFP Questions</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Search questions..." 
              className="w-[250px] pl-8" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1" 
            onClick={saveAllAnswers}
            disabled={unsavedQuestions.size === 0 || savingQuestions.size > 0}
          >
            {savingQuestions.size > 0 ? (
              <>
                <Spinner className="h-4 w-4" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save All
              </>
            )}
          </Button>
          
          <Button variant="outline" size="sm" className="gap-1" onClick={handleExportAnswers}>
            <Download className="h-4 w-4" />
            Export
          </Button>
          
          <Button 
            variant="default" 
            size="sm" 
            className="gap-1"
            onClick={handleGenerateAllAnswers}
            disabled={isGeneratingAll}
          >
            {isGeneratingAll ? (
              <>
                <Spinner className="h-4 w-4" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate All
              </>
            )}
          </Button>
        </div>
      </div>

      {unsavedQuestions.size > 0 && (
        <div className="text-sm text-amber-600 flex items-center justify-end">
          <span>{unsavedQuestions.size} question{unsavedQuestions.size > 1 ? 's' : ''} with unsaved changes</span>
        </div>
      )}

      <SourceDetailsDialog />

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Questions ({counts.all})</TabsTrigger>
          <TabsTrigger value="answered">Answered ({counts.answered})</TabsTrigger>
          <TabsTrigger value="unanswered">Unanswered ({counts.unanswered})</TabsTrigger>
          <TabsTrigger value="flagged">Needs Review ({counts.flagged})</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-1">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Question Navigator</CardTitle>
                </CardHeader>
                <CardContent>
                  {rfpDocument && (
                    <QuestionNavigator
                      sections={rfpDocument.sections}
                      answers={answers}
                      unsavedQuestions={unsavedQuestions}
                      onSelectQuestion={(id) => {
                        setSelectedQuestion(id)
                        setShowAIPanel(false)
                      }}
                      searchQuery={searchQuery}
                    />
                  )}
                </CardContent>
              </Card>
            </div>
            <div className="md:col-span-2">
              {selectedQuestion && questionData ? (
                <div className="space-y-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{questionData.section.title}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {questionData.question.question}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {unsavedQuestions.has(selectedQuestion) && (
                            <Badge variant="outline" className="bg-amber-50 text-amber-700">
                              Unsaved
                            </Badge>
                          )}
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                            {answers[selectedQuestion]?.text ? "Answered" : "Needs Answer"}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Textarea
                        placeholder="Enter your answer here..."
                        className="min-h-[200px]"
                        value={answers[selectedQuestion]?.text || ""}
                        onChange={(e) => handleAnswerChange(selectedQuestion, e.target.value)}
                      />
                      
                      {/* Display sources if available */}
                      {answers[selectedQuestion]?.sources && answers[selectedQuestion].sources.length > 0 && (
                        <div className="mt-2 text-sm">
                          <div className="font-medium text-gray-700">Sources:</div>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {answers[selectedQuestion].sources.map((source) => (
                              <span 
                                key={source.id} 
                                className="inline-block px-2 py-1 bg-slate-100 border border-slate-200 rounded text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer" 
                                title={`${source.fileName}${source.pageNumber ? ` - Page ${source.pageNumber}` : ''}`}
                                onClick={() => handleSourceClick(source)}
                              >
                                {source.id}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowAIPanel(!showAIPanel)}
                            className="gap-1"
                          >
                            <Sparkles className="h-4 w-4" />
                            {showAIPanel ? "Hide AI Suggestions" : "Get AI Suggestions"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1"
                            onClick={() => handleGenerateAnswer(selectedQuestion)}
                            disabled={isGenerating[selectedQuestion]}
                          >
                            {isGenerating[selectedQuestion] ? (
                              <>
                                <Spinner className="h-4 w-4" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <Sparkles className="h-4 w-4" />
                                Generate Answer
                              </>
                            )}
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleSaveDraft(selectedQuestion)}
                            disabled={isQuestionSaving(selectedQuestion) || !unsavedQuestions.has(selectedQuestion)}
                          >
                            {isQuestionSaving(selectedQuestion) ? (
                              <>
                                <Spinner className="h-4 w-4 mr-2" />
                                Saving...
                              </>
                            ) : "Save Answer"}
                          </Button>
                          <Button 
                            size="sm" 
                            className="gap-1"
                            onClick={() => handleMarkComplete(selectedQuestion)}
                            disabled={isQuestionSaving(selectedQuestion)}
                          >
                            <CheckCircle className="h-4 w-4" />
                            Mark as Complete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {showAIPanel && <AISuggestionsPanel questionId={selectedQuestion} />}
                </div>
              ) : (
                <Card className="flex h-[400px] items-center justify-center">
                  <div className="text-center">
                    <p className="text-muted-foreground">Select a question from the navigator to view and answer</p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
        <TabsContent value="answered">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-1">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Answered Questions</CardTitle>
                </CardHeader>
                <CardContent>
                  {rfpDocument && (
                    <div className="space-y-2">
                      {getFilteredQuestions("answered").map((question) => (
                        <button
                          key={question.id}
                          className={cn(
                            "flex w-full text-left items-start p-2 rounded-md text-sm hover:bg-muted",
                            unsavedQuestions.has(question.id) && "bg-amber-50",
                            selectedQuestion === question.id && "bg-muted"
                          )}
                          onClick={() => {
                            setSelectedQuestion(question.id);
                            setShowAIPanel(false);
                          }}
                        >
                          <div className="flex w-full">
                            <div className="flex-shrink-0 w-5 h-5 mt-0.5 mr-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            </div>
                            <div className={cn(
                              "flex-1 mr-2",
                              unsavedQuestions.has(question.id) && "font-medium text-amber-700"
                            )}>
                              <div className="font-medium">{question.sectionTitle}</div>
                              {question.question}
                              {unsavedQuestions.has(question.id) && <span className="ml-1 text-amber-600">*</span>}
                            </div>
                          </div>
                        </button>
                      ))}
                      {getFilteredQuestions("answered").length === 0 && (
                        <p className="text-muted-foreground text-center p-4">No answered questions found</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            <div className="md:col-span-2">
              {selectedQuestion && questionData ? (
                <div className="space-y-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{questionData.section.title}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {questionData.question.question}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {unsavedQuestions.has(selectedQuestion) && (
                            <Badge variant="outline" className="bg-amber-50 text-amber-700">
                              Unsaved
                            </Badge>
                          )}
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            Answered
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Textarea
                        placeholder="Enter your answer here..."
                        className="min-h-[200px]"
                        value={answers[selectedQuestion]?.text || ""}
                        onChange={(e) => handleAnswerChange(selectedQuestion, e.target.value)}
                      />
                      
                      {/* Display sources if available */}
                      {answers[selectedQuestion]?.sources && answers[selectedQuestion].sources.length > 0 && (
                        <div className="mt-2 text-sm">
                          <div className="font-medium text-gray-700">Sources:</div>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {answers[selectedQuestion].sources.map((source) => (
                              <span 
                                key={source.id} 
                                className="inline-block px-2 py-1 bg-slate-100 border border-slate-200 rounded text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer" 
                                title={`${source.fileName}${source.pageNumber ? ` - Page ${source.pageNumber}` : ''}`}
                                onClick={() => handleSourceClick(source)}
                              >
                                {source.id}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowAIPanel(!showAIPanel)}
                            className="gap-1"
                          >
                            <Sparkles className="h-4 w-4" />
                            {showAIPanel ? "Hide AI Suggestions" : "Get AI Suggestions"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1"
                            onClick={() => handleGenerateAnswer(selectedQuestion)}
                            disabled={isGenerating[selectedQuestion]}
                          >
                            {isGenerating[selectedQuestion] ? (
                              <>
                                <Spinner className="h-4 w-4" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <Sparkles className="h-4 w-4" />
                                Generate Answer
                              </>
                            )}
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleSaveDraft(selectedQuestion)}
                            disabled={isQuestionSaving(selectedQuestion) || !unsavedQuestions.has(selectedQuestion)}
                          >
                            {isQuestionSaving(selectedQuestion) ? (
                              <>
                                <Spinner className="h-4 w-4 mr-2" />
                                Saving...
                              </>
                            ) : "Save Answer"}
                          </Button>
                          <Button 
                            size="sm" 
                            className="gap-1"
                            onClick={() => handleMarkComplete(selectedQuestion)}
                            disabled={isQuestionSaving(selectedQuestion)}
                          >
                            <CheckCircle className="h-4 w-4" />
                            Mark as Complete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {showAIPanel && <AISuggestionsPanel questionId={selectedQuestion} />}
                </div>
              ) : (
                <Card className="flex h-[400px] items-center justify-center">
                  <div className="text-center">
                    <p className="text-muted-foreground">Select a question from the list to view and edit</p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
        <TabsContent value="unanswered">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-1">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Unanswered Questions</CardTitle>
                </CardHeader>
                <CardContent>
                  {rfpDocument && (
                    <div className="space-y-2">
                      {getFilteredQuestions("unanswered").map((question) => (
                        <button
                          key={question.id}
                          className={cn(
                            "flex w-full text-left items-start p-2 rounded-md text-sm hover:bg-muted",
                            selectedQuestion === question.id && "bg-muted"
                          )}
                          onClick={() => {
                            setSelectedQuestion(question.id);
                            setShowAIPanel(false);
                          }}
                        >
                          <div className="flex w-full">
                            <div className="flex-shrink-0 w-5 h-5 mt-0.5 mr-2">
                              <div className="h-4 w-4 rounded-full border border-muted-foreground" />
                            </div>
                            <div className="flex-1 mr-2">
                              <div className="font-medium">{question.sectionTitle}</div>
                              {question.question}
                            </div>
                          </div>
                        </button>
                      ))}
                      {getFilteredQuestions("unanswered").length === 0 && (
                        <p className="text-muted-foreground text-center p-4">No unanswered questions found</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            <div className="md:col-span-2">
              {selectedQuestion && questionData ? (
                <div className="space-y-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{questionData.section.title}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {questionData.question.question}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                            Needs Answer
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Textarea
                        placeholder="Enter your answer here..."
                        className="min-h-[200px]"
                        value={answers[selectedQuestion]?.text || ""}
                        onChange={(e) => handleAnswerChange(selectedQuestion, e.target.value)}
                      />
                      
                      {/* Display sources if available */}
                      {answers[selectedQuestion]?.sources && answers[selectedQuestion].sources.length > 0 && (
                        <div className="mt-2 text-sm">
                          <div className="font-medium text-gray-700">Sources:</div>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {answers[selectedQuestion].sources.map((source) => (
                              <span 
                                key={source.id} 
                                className="inline-block px-2 py-1 bg-slate-100 border border-slate-200 rounded text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer" 
                                title={`${source.fileName}${source.pageNumber ? ` - Page ${source.pageNumber}` : ''}`}
                                onClick={() => handleSourceClick(source)}
                              >
                                {source.id}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowAIPanel(!showAIPanel)}
                            className="gap-1"
                          >
                            <Sparkles className="h-4 w-4" />
                            {showAIPanel ? "Hide AI Suggestions" : "Get AI Suggestions"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1"
                            onClick={() => handleGenerateAnswer(selectedQuestion)}
                            disabled={isGenerating[selectedQuestion]}
                          >
                            {isGenerating[selectedQuestion] ? (
                              <>
                                <Spinner className="h-4 w-4" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <Sparkles className="h-4 w-4" />
                                Generate Answer
                              </>
                            )}
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleSaveDraft(selectedQuestion)}
                            disabled={isQuestionSaving(selectedQuestion) || !unsavedQuestions.has(selectedQuestion)}
                          >
                            {isQuestionSaving(selectedQuestion) ? (
                              <>
                                <Spinner className="h-4 w-4 mr-2" />
                                Saving...
                              </>
                            ) : "Save Answer"}
                          </Button>
                          <Button 
                            size="sm" 
                            className="gap-1"
                            onClick={() => handleMarkComplete(selectedQuestion)}
                            disabled={isQuestionSaving(selectedQuestion)}
                          >
                            <CheckCircle className="h-4 w-4" />
                            Mark as Complete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {showAIPanel && <AISuggestionsPanel questionId={selectedQuestion} />}
                </div>
              ) : (
                <Card className="flex h-[400px] items-center justify-center">
                  <div className="text-center">
                    <p className="text-muted-foreground">Select a question from the list to view and answer</p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
        <TabsContent value="flagged">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-1">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Questions Needing Review</CardTitle>
                </CardHeader>
                <CardContent>
                  {rfpDocument && (
                    <div className="space-y-2">
                      {getFilteredQuestions("flagged").map((question) => (
                        <button
                          key={question.id}
                          className={cn(
                            "flex w-full text-left items-start p-2 rounded-md text-sm hover:bg-muted",
                            unsavedQuestions.has(question.id) && "bg-amber-50",
                            selectedQuestion === question.id && "bg-muted"
                          )}
                          onClick={() => {
                            setSelectedQuestion(question.id);
                            setShowAIPanel(false);
                          }}
                        >
                          <div className="flex w-full">
                            <div className="flex-shrink-0 w-5 h-5 mt-0.5 mr-2">
                              <AlertCircle className="h-4 w-4 text-yellow-500" />
                            </div>
                            <div className={cn(
                              "flex-1 mr-2",
                              unsavedQuestions.has(question.id) && "font-medium text-amber-700"
                            )}>
                              <div className="font-medium">{question.sectionTitle}</div>
                              {question.question}
                              {unsavedQuestions.has(question.id) && <span className="ml-1 text-amber-600">*</span>}
                            </div>
                          </div>
                        </button>
                      ))}
                      {getFilteredQuestions("flagged").length === 0 && (
                        <p className="text-muted-foreground text-center p-4">No questions flagged for review</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            <div className="md:col-span-2">
              {selectedQuestion && questionData ? (
                <div className="space-y-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{questionData.section.title}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {questionData.question.question}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {unsavedQuestions.has(selectedQuestion) && (
                            <Badge variant="outline" className="bg-amber-50 text-amber-700">
                              Unsaved
                            </Badge>
                          )}
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                            Needs Review
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Textarea
                        placeholder="Enter your answer here..."
                        className="min-h-[200px]"
                        value={answers[selectedQuestion]?.text || ""}
                        onChange={(e) => handleAnswerChange(selectedQuestion, e.target.value)}
                      />
                      
                      {/* Display sources if available */}
                      {answers[selectedQuestion]?.sources && answers[selectedQuestion].sources.length > 0 && (
                        <div className="mt-2 text-sm">
                          <div className="font-medium text-gray-700">Sources:</div>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {answers[selectedQuestion].sources.map((source) => (
                              <span 
                                key={source.id} 
                                className="inline-block px-2 py-1 bg-slate-100 border border-slate-200 rounded text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer" 
                                title={`${source.fileName}${source.pageNumber ? ` - Page ${source.pageNumber}` : ''}`}
                                onClick={() => handleSourceClick(source)}
                              >
                                {source.id}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowAIPanel(!showAIPanel)}
                            className="gap-1"
                          >
                            <Sparkles className="h-4 w-4" />
                            {showAIPanel ? "Hide AI Suggestions" : "Get AI Suggestions"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1"
                            onClick={() => handleGenerateAnswer(selectedQuestion)}
                            disabled={isGenerating[selectedQuestion]}
                          >
                            {isGenerating[selectedQuestion] ? (
                              <>
                                <Spinner className="h-4 w-4" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <Sparkles className="h-4 w-4" />
                                Generate Answer
                              </>
                            )}
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleSaveDraft(selectedQuestion)}
                            disabled={isQuestionSaving(selectedQuestion) || !unsavedQuestions.has(selectedQuestion)}
                          >
                            {isQuestionSaving(selectedQuestion) ? (
                              <>
                                <Spinner className="h-4 w-4 mr-2" />
                                Saving...
                              </>
                            ) : "Save Answer"}
                          </Button>
                          <Button 
                            size="sm" 
                            className="gap-1"
                            onClick={() => handleMarkComplete(selectedQuestion)}
                            disabled={isQuestionSaving(selectedQuestion)}
                          >
                            <CheckCircle className="h-4 w-4" />
                            Mark as Complete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {showAIPanel && <AISuggestionsPanel questionId={selectedQuestion} />}
                </div>
              ) : (
                <Card className="flex h-[400px] items-center justify-center">
                  <div className="text-center">
                    <p className="text-muted-foreground">Select a question from the list to view and edit</p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
      <Toaster />
    </div>
  )
}

// Main export that wraps the inner component with Suspense
export function QuestionsSection() {
  return (
    <Suspense fallback={
      <div className="space-y-6">
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
      <QuestionsSectionInner />
    </Suspense>
  )
}
