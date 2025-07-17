import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { organizationService } from '@/lib/organization-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    
    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Get current user for authorization
    const currentUser = await organizationService.getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify user has access to this project
    const project = await db.project.findUnique({
      where: { id: projectId },
      include: { organization: true }
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const isMember = await organizationService.isUserOrganizationMember(
      currentUser.id,
      project.organization.id
    );
    
    if (!isMember) {
      return NextResponse.json(
        { error: 'You do not have access to this project' },
        { status: 403 }
      );
    }

    // Fetch timeline data - questions with their answers and timestamps
    const timelineData = await db.question.findMany({
      where: {
        projectId,
        answer: {
          isNot: null // Only questions that have been answered
        }
      },
      include: {
        answer: {
          select: {
            id: true,
            text: true,
            createdAt: true,
            updatedAt: true
          }
        }
      },
      orderBy: {
        answer: {
          updatedAt: 'desc'
        }
      },
      take: 50 // Limit to most recent 50 activities
    });

    // Transform data for frontend consumption
    const activities = timelineData.map(question => ({
      id: question.id,
      type: 'question_answered',
      questionText: question.text,
      questionTopic: question.topic,
      answerPreview: question.answer?.text ? question.answer.text.substring(0, 150) + (question.answer.text.length > 150 ? '...' : '') : '',
      answeredAt: question.answer?.updatedAt,
      createdAt: question.answer?.createdAt,
      isUpdated: question.answer?.createdAt !== question.answer?.updatedAt
    }));

    return NextResponse.json({
      success: true,
      activities,
      totalCount: activities.length
    });

  } catch (error) {
    console.error('Error fetching project timeline:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project timeline' },
      { status: 500 }
    );
  }
} 