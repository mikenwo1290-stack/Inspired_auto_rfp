import { NextRequest, NextResponse } from 'next/server';
import { projectService } from '@/lib/project-service';

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
    
    // Get questions from the database
    const rfpDocument = await projectService.getQuestions(projectId);
    
    if (!rfpDocument) {
      console.log(`No RFP document found for projectId: ${projectId}`);
      return NextResponse.json(
        { error: 'No questions found for this project' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(rfpDocument);
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
} 