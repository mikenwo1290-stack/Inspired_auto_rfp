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
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const projectId = (await params).projectId;
    
    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }
    
    // Get the answers from the request body
    const answers = await request.json();
    
    // Normalize the answers format for backward compatibility
    const normalizedAnswers = Object.entries(answers).reduce((acc, [questionId, answer]) => {
      // Handle both string answers and objects with sources
      if (typeof answer === 'string') {
        acc[questionId] = { text: answer };
      } else if (answer && typeof answer === 'object' && 'text' in answer) {
        // Type assertion after validation
        const answerObj = answer as AnswerData;
        acc[questionId] = {
          text: answerObj.text,
          sources: answerObj.sources
        };
      } else {
        // Fallback for invalid data
        console.warn(`Invalid answer format for question ${questionId}, using empty string`);
        acc[questionId] = { text: '' };
      }
      return acc;
    }, {} as Record<string, AnswerData>);
    
    // Save answers to the database
    await projectService.saveAnswers(projectId, normalizedAnswers);
    
    return NextResponse.json({ 
      success: true,
      message: 'Answers saved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error saving answers:', error);
    return NextResponse.json(
      { error: 'Failed to save answers' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const projectId = (await params).projectId;
    
    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }
    
    // Get answers from the database
    const answers = await projectService.getAnswers(projectId);
    
    return NextResponse.json(answers);
  } catch (error) {
    console.error('Error fetching answers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch answers' },
      { status: 500 }
    );
  }
} 