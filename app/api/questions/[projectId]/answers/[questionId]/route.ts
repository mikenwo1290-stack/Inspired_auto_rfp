import { NextRequest, NextResponse } from 'next/server';
import { projectService } from '@/lib/project-service';
import { AnswerSource } from '@/types/api';

// Type for answer data
interface AnswerData {
  text: string;
  sources?: AnswerSource[];
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; questionId: string }> }
) {
  try {
    const { projectId, questionId } = await params;
    
    if (!projectId || !questionId) {
      return NextResponse.json(
        { error: 'Project ID and Question ID are required' },
        { status: 400 }
      );
    }
    
    // Get the answer from the request body
    const answerData = await request.json();
    
    // Normalize to the expected format
    let normalizedAnswer: AnswerData;
    
    if (typeof answerData === 'string') {
      normalizedAnswer = { text: answerData };
    } else if (answerData && typeof answerData === 'object' && 'text' in answerData) {
      // Type assertion after validation
      normalizedAnswer = {
        text: answerData.text,
        sources: answerData.sources
      };
    } else {
      // Fallback for invalid data
      console.warn(`Invalid answer format for question ${questionId}, using empty string`);
      normalizedAnswer = { text: '' };
    }
    
    // Create a map with just this single answer
    const singleAnswerMap = {
      [questionId]: normalizedAnswer
    };
    
    // Save this single answer to the database
    await projectService.saveAnswers(projectId, singleAnswerMap);
    
    return NextResponse.json({ 
      success: true,
      message: 'Answer saved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error(`Error saving answer for question:`, error);
    return NextResponse.json(
      { error: 'Failed to save answer' },
      { status: 500 }
    );
  }
} 