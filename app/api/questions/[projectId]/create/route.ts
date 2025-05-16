import { NextRequest, NextResponse } from 'next/server';
import { projectService } from '@/lib/project-service';

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
    
    // Get the RFP document data from the request body
    const rfpDocument = await request.json();
    
    if (!rfpDocument || !Array.isArray(rfpDocument.sections)) {
      return NextResponse.json(
        { error: 'Invalid RFP document format' },
        { status: 400 }
      );
    }
    
    // Save the questions to the database
    const result = await projectService.saveQuestions(projectId, rfpDocument.sections);
    
    return NextResponse.json({
      success: true,
      message: 'Questions saved successfully',
    });
  } catch (error) {
    console.error('Error saving questions:', error);
    return NextResponse.json(
      { error: 'Failed to save questions' },
      { status: 500 }
    );
  }
} 