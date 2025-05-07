/*
 * This functionality has been temporarily removed to focus on document upload.
 * We'll implement it in a future update when adding the dashboard.
 */

import { NextRequest, NextResponse } from 'next/server';
import { LlamaIndexService } from '@/lib/llama-index-service';

// Initialize the LlamaIndex service
let llamaIndexService: LlamaIndexService;

try {
  llamaIndexService = new LlamaIndexService();
} catch (error) {
  console.error('Failed to initialize LlamaIndex service:', error);
}

export async function POST(request: NextRequest) {
  try {
    // Check if LlamaIndex service is initialized
    if (!llamaIndexService) {
      return NextResponse.json(
        { error: 'LlamaIndex service is not configured. Please check your environment variables.' },
        { status: 500 }
      );
    }

    const { question, documentIds } = await request.json();
    
    if (!question) {
      return NextResponse.json(
        { error: 'No question provided' },
        { status: 400 }
      );
    }

    // Generate response using LlamaIndex
    const result = await llamaIndexService.generateResponse(question, documentIds);

    console.log(result);

    
    return NextResponse.json({
      success: true,
      response: result.response,
      sources: result.sources,
      metadata: {
        confidence: result.confidence,
        generatedAt: result.generatedAt,
      },
    });
  } catch (error) {
    console.error('Error generating response:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}
