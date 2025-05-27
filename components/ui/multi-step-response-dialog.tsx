'use client';

import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './dialog';
import { Button } from './button';
import { MultiStepResponseDisplay } from './multi-step-response';
import { MultiStepResponse } from '@/lib/validators/multi-step-response';

interface MultiStepResponseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  response: MultiStepResponse | null;
  isLoading: boolean;
  error: string | null;
  onAcceptResponse: (response: string, sources: any[]) => void;
  onClose: () => void;
}

export function MultiStepResponseDialog({
  open,
  onOpenChange,
  response,
  isLoading,
  error,
  onAcceptResponse,
  onClose,
}: MultiStepResponseDialogProps) {
  const handleAccept = () => {
    if (response) {
      onAcceptResponse(response.finalResponse, response.sources);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Multi-Step Response Generation</DialogTitle>
          <DialogDescription>
            {isLoading 
              ? 'AI is analyzing your question and generating a comprehensive response...'
              : 'Review the AI-generated response and reasoning process'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="text-sm text-red-700">
                <strong>Error:</strong> {error}
              </div>
            </div>
          )}

          {response && (
            <MultiStepResponseDisplay 
              response={response} 
              isLoading={isLoading}
            />
          )}

          {isLoading && !response && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Generating multi-step response...</p>
                <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
              </div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            {response ? 'Cancel' : 'Close'}
          </Button>
          {response && !isLoading && (
            <Button onClick={handleAccept}>
              Use This Response
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 