import { useState, useCallback } from 'react';
import { MultiStepResponse } from '@/lib/validators/multi-step-response';

interface UseMultiStepResponseReturn {
  isGenerating: boolean;
  response: MultiStepResponse | null;
  error: string | null;
  generateResponse: (params: {
    question: string;
    questionId: string;
    projectId: string;
    indexIds: string[];
  }) => Promise<void>;
  reset: () => void;
}

export function useMultiStepResponse(): UseMultiStepResponseReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [response, setResponse] = useState<MultiStepResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateResponse = useCallback(async (params: {
    question: string;
    questionId: string;
    projectId: string;
    indexIds: string[];
  }) => {
    setIsGenerating(true);
    setError(null);
    setResponse(null);

    try {
      const response = await fetch('/api/generate-response-multistep', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: params.question,
          questionId: params.questionId,
          projectId: params.projectId,
          indexIds: params.indexIds,
          userPreferences: {
            detailLevel: 'standard',
            includeRecommendations: true,
            showReasoning: true,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to generate multi-step response');
      }

      const result = await response.json();
      
      // Convert date strings back to Date objects
      const processedResult: MultiStepResponse = {
        ...result,
        steps: result.steps.map((step: any) => ({
          ...step,
          startTime: new Date(step.startTime),
          endTime: step.endTime ? new Date(step.endTime) : undefined,
        })),
        metadata: {
          ...result.metadata,
          processingStartTime: new Date(result.metadata.processingStartTime),
          processingEndTime: new Date(result.metadata.processingEndTime),
        },
      };

      setResponse(processedResult);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Multi-step response generation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const reset = useCallback(() => {
    setIsGenerating(false);
    setResponse(null);
    setError(null);
  }, []);

  return {
    isGenerating,
    response,
    error,
    generateResponse,
    reset,
  };
} 