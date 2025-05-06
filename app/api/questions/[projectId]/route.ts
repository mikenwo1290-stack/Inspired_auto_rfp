import { NextRequest, NextResponse } from 'next/server';
import { projectService } from '@/lib/project-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    console.log('GET request received at /api/questions/[projectId]');
    console.log('Params:', params);
    
    const projectId = (await params).projectId;
    console.log('Project ID extracted from params:', projectId);
    
    if (!projectId) {
      console.log('No project ID found in params');
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }
    
    // Get questions from the database
    console.log(`Calling projectService.getQuestions with projectId: ${projectId}`);
    const rfpDocument = await projectService.getQuestions(projectId);
    
    if (!rfpDocument) {
      console.log(`No RFP document found for projectId: ${projectId}`);
      return NextResponse.json(
        { error: 'No questions found for this project' },
        { status: 404 }
      );
    }
    
    console.log(`Successfully retrieved RFP document with ${rfpDocument.sections.length} sections`);
    return NextResponse.json(rfpDocument);
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
} 