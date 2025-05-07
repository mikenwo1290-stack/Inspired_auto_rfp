"use client";

import React from "react";
import { RfpSection } from "@/types/api";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { QuestionItem } from "./QuestionItem";

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

// Interface for answer data
interface AnswerData {
  text: string;
  sources?: AnswerSource[];
}

// SectionItem component - represents a section with its questions
interface SectionItemProps {
  section: RfpSection;
  isActive: boolean;
  answers: Record<string, AnswerData>;
  isGenerating: Record<string, boolean>;
  onToggle: (sectionId: string) => void;
  onAnswerChange: (questionId: string, value: string) => void;
  onGenerateAnswer: (questionId: string) => void;
  onConfirmAnswer?: (questionId: string, answer: string, sources?: AnswerSource[]) => void;
}

export function SectionItem({
  section,
  isActive,
  answers,
  isGenerating,
  onToggle,
  onAnswerChange,
  onGenerateAnswer,
  onConfirmAnswer
}: SectionItemProps) {
  return (
    <Accordion
      type="single"
      collapsible
      defaultValue={isActive ? section.id : undefined}
      value={isActive ? section.id : undefined}
      onValueChange={(value) => onToggle(value || "")}
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
              <QuestionItem
                key={question.id}
                question={question}
                answer={answers[question.id]?.text || ''}
                isGenerating={isGenerating[question.id] || false}
                sources={answers[question.id]?.sources || []}
                onAnswerChange={(value) => onAnswerChange(question.id, value)}
                onGenerateAnswer={() => onGenerateAnswer(question.id)}
                onConfirmAnswer={onConfirmAnswer}
              />
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
} 