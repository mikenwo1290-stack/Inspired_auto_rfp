"use client"

import { useState, useEffect } from "react"
import { ChevronDown, ChevronRight, CheckCircle, AlertCircle, Clock, CircleDot } from "lucide-react"
import { cn } from "@/lib/utils"
import { RfpSection } from "@/types/api"

// Interface for answer data
interface AnswerData {
  text: string;
  sources?: any[];
}

// Define possible question statuses
type QuestionStatus = "unanswered" | "in-progress" | "complete" | "needs-review";

interface QuestionNavigatorProps {
  onSelectQuestion: (id: string) => void;
  sections: RfpSection[];
  answers: Record<string, AnswerData>;
  unsavedQuestions?: Set<string>;
  searchQuery?: string;
}

export function QuestionNavigator({ 
  onSelectQuestion, 
  sections,
  answers,
  unsavedQuestions = new Set(),
  searchQuery = "" 
}: QuestionNavigatorProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})

  // Initialize expanded sections
  useEffect(() => {
    if (sections.length > 0) {
      const initialState: Record<string, boolean> = {};
      sections.forEach((section, index) => {
        // Expand the first two sections by default
        initialState[section.id] = index < 2;
      });
      setExpandedSections(initialState);
    }
  }, [sections]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }))
  }

  // Get question status based on answers
  const getQuestionStatus = (questionId: string): QuestionStatus => {
    const answer = answers[questionId];
    
    // Add logic to determine if a question needs review
    if (!answer || !answer.text) return "unanswered";
    if (answer.text.length < 20) return "in-progress"; // Short answers considered in-progress
    
    // Additional logic could be added here to check if a question needs review
    // For demo purposes, we'll mark questions with specific keywords as needing review
    if (answer.text.toLowerCase().includes("review") || 
        answer.text.toLowerCase().includes("incomplete") ||
        answer.text.toLowerCase().includes("todo")) {
      return "needs-review";
    }
    
    return "complete";
  };

  // Filter sections and questions based on search query
  const filteredSections = sections.map(section => {
    // If no search query, return all questions
    if (!searchQuery) return section;
    
    // Filter questions that match the search query
    const filteredQuestions = section.questions.filter(question => 
      question.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    // Return section with filtered questions
    return {
      ...section,
      questions: filteredQuestions
    };
  }).filter(section => section.questions.length > 0);

  // Get truncated text that tries to end at a natural break
  const getTruncatedText = (text: string, maxLength: number = 70) => {
    if (text.length <= maxLength) return text;
    
    // Try to end at a natural break
    const breakPoint = text.substring(0, maxLength).lastIndexOf(' ');
    if (breakPoint > maxLength * 0.7) { // Only use breakpoint if it's not too short
      return text.substring(0, breakPoint) + '...';
    }
    
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="space-y-2 text-sm">
      {filteredSections.map((section) => (
        <div key={section.id} className="space-y-1">
          <button
            className="flex w-full items-center justify-between rounded-md p-2 font-medium hover:bg-muted"
            onClick={() => toggleSection(section.id)}
          >
            <span className="text-left pr-2 flex-1">{getTruncatedText(section.title, 85)}</span>
            {expandedSections[section.id] ? <ChevronDown className="h-4 w-4 flex-shrink-0" /> : <ChevronRight className="h-4 w-4 flex-shrink-0" />}
          </button>
          {expandedSections[section.id] && (
            <div className="ml-2 space-y-1 pl-2">
              {section.questions.map((question) => {
                const status = getQuestionStatus(question.id);
                const isUnsaved = unsavedQuestions.has(question.id);
                
                return (
                  <button
                    key={question.id}
                    className={cn(
                      "flex w-full text-left items-start p-2 rounded-md text-sm hover:bg-muted",
                      isUnsaved && "bg-amber-50"
                    )}
                    onClick={() => onSelectQuestion(question.id)}
                  >
                    <div className="flex w-full">
                      <div className="flex-shrink-0 w-5 h-5 mt-0.5 mr-2">
                        {status === "complete" && <CheckCircle className="h-4 w-4 text-green-500" />}
                        {status === "needs-review" && <AlertCircle className="h-4 w-4 text-yellow-500" />}
                        {status === "in-progress" && <Clock className="h-4 w-4 text-blue-500" />}
                        {status === "unanswered" && (
                          <div className="h-4 w-4 rounded-full border border-muted-foreground" />
                        )}
                      </div>
                      <div className={cn(
                        "flex-1 mr-2",
                        status === "complete" && "text-muted-foreground",
                        isUnsaved && "font-medium text-amber-700"
                      )}>
                        {getTruncatedText(question.question)}
                        {isUnsaved && <span className="ml-1 text-amber-600">*</span>}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
