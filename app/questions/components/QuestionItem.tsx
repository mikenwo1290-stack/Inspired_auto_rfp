"use client";

import React, { useState, useEffect } from "react";
import { RfpQuestion } from "@/types/api";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

// Source interface for answer sources
interface AnswerSource {
  id: number;
  fileName: string;
  filePath?: string;
  pageNumber?: number | string;
  documentId?: string;
  relevance?: number | null;
  textContent?: string | null;
}

// QuestionItem component - represents a single question with its answer
interface QuestionItemProps {
  question: RfpQuestion;
  answer: string;
  isGenerating: boolean;
  sources?: AnswerSource[];
  onAnswerChange: (value: string) => void;
  onGenerateAnswer: () => void;
  onConfirmAnswer?: (questionId: string, answer: string, sources?: AnswerSource[]) => void;
}

export function QuestionItem({
  question,
  answer,
  isGenerating,
  sources = [],
  onAnswerChange,
  onGenerateAnswer,
  onConfirmAnswer
}: QuestionItemProps) {
  const [localAnswer, setLocalAnswer] = useState(answer);
  const [isEdited, setIsEdited] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [selectedSource, setSelectedSource] = useState<AnswerSource | null>(null);
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);
  const [isTextTabActive, setIsTextTabActive] = useState(true);
  
  // Update local answer when the prop changes (from parent)
  useEffect(() => {
    if (answer !== '') {
      // Only update when there's an actual answer
      setLocalAnswer(answer);
      
      // If we're getting a new answer while not typing (isGenerating was just true)
      if (isGenerating === false && answer !== localAnswer) {
        setIsEdited(true);
        setIsGenerated(true);
        setIsConfirmed(false);
      }
    }
  }, [answer, isGenerating, localAnswer]);
  
  // Handle local answer change from user typing
  const handleLocalAnswerChange = (value: string) => {
    setLocalAnswer(value);
    setIsEdited(value !== answer);
    setIsGenerated(false);
    setIsConfirmed(false);
  };

  // Handle local answer generation
  const handleGenerate = () => {
    // Call parent's generation function
    onGenerateAnswer();
  };

  // Handle confirmation/saving of answer
  const handleConfirmAnswer = () => {
    setIsSaving(true);
    
    // This is where we actually save the answer to the parent state
    if (onConfirmAnswer) {
      onConfirmAnswer(question.id, localAnswer, sources);
    } else {
      onAnswerChange(localAnswer);
    }
    
    // Show saving state briefly for UX feedback
    setTimeout(() => {
      setIsSaving(false);
      setIsConfirmed(true);
      setIsEdited(false);
      setIsGenerated(false);
    }, 500);
  };

  // Handle source click to open the modal
  const handleSourceClick = (source: AnswerSource) => {
    setSelectedSource(source);
    setIsSourceModalOpen(true);
    setIsTextTabActive(true);
  };

  return (
    <div className="border-t pt-4 first:border-t-0 first:pt-0">
      <div className="flex justify-between items-start mb-2">
        <label htmlFor={question.id} className="block text-sm font-medium">
          {question.question}
        </label>
        {isConfirmed && !isEdited && (
          <span className="text-xs text-green-600 flex items-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="12" 
              height="12" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="mr-1"
            >
              <path d="M20 6L9 17l-5-5"/>
            </svg>
            Saved
          </span>
        )}
      </div>
      <div className="relative">
        <textarea
          id={question.id}
          rows={4}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 
            ${isEdited ? 'border-amber-300 focus:ring-amber-500' : 'focus:ring-blue-500'}
            ${isConfirmed && !isEdited ? 'border-green-200 bg-green-50' : ''} 
            ${isGenerated ? 'bg-blue-50' : ''}`}
          value={localAnswer}
          onChange={(e) => handleLocalAnswerChange(e.target.value)}
          placeholder="Type your answer here..."
          disabled={isSaving}
        />
        
        <div className="absolute top-2 right-2 flex gap-1">
          {/* Generate Answer Button */}
          <button
            type="button"
            className="p-1.5 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
            title="Generate answer automatically"
            onClick={handleGenerate}
            disabled={isGenerating || isSaving}
          >
            {isGenerating ? (
              <Spinner size="sm" className="h-4 w-4" />
            ) : (
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
                className="h-4 w-4"
              >
                <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
                <path d="M9 18h6" />
                <path d="M10 22h4" />
              </svg>
            )}
          </button>
        </div>
      </div>
      
      {/* Display sources if available */}
      {sources.length > 0 && (
        <div className="mt-2 text-sm">
          <div className="font-medium text-gray-700">Sources:</div>
          <div className="flex flex-wrap gap-2 mt-1">
            {sources.map((source) => (
              <span 
                key={source.id} 
                className="inline-block px-2 py-1 bg-slate-100 rounded text-slate-700 hover:bg-slate-200 cursor-pointer" 
                title={`${source.fileName}${source.pageNumber ? ` - Page ${source.pageNumber}` : ''}`}
                onClick={() => handleSourceClick(source)}
              >
                {source.id}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* Source Details Modal */}
      <Dialog open={isSourceModalOpen} onOpenChange={setIsSourceModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Source Information</DialogTitle>
            <DialogDescription>
              Details about this source document
            </DialogDescription>
          </DialogHeader>
          
          {selectedSource && (
            <div className="mt-4">
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
                    <ScrollArea className="h-60 border rounded-md p-3">
                      <div className="whitespace-pre-wrap font-mono text-sm">
                        {selectedSource.textContent}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="h-60 border rounded-md p-3 flex items-center justify-center text-gray-500">
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
                  
                  {selectedSource.relevance !== null && (
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
      
      {/* Save/Confirm button - shown prominently when answer is generated or edited */}
      {isEdited && (
        <div className="mt-2 flex justify-end">
          <Button
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={handleConfirmAnswer}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Spinner size="sm" className="mr-2 h-4 w-4" />
                Saving...
              </>
            ) : isGenerated ? (
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
                  className="mr-1.5 h-4 w-4"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                Save Generated Answer
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
                  className="mr-1.5 h-4 w-4"
                >
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
                Save Changes
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
} 