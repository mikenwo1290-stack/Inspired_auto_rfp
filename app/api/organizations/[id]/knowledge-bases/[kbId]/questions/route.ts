import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { organizationService } from '@/lib/organization-service';

// Get all questions for a knowledge base
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; kbId: string }> }
) {
  try {
    const { id, kbId } = await params;
    const organizationId = id;

    const currentUser = await organizationService.getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check if user is a member of this organization
    const isMember = await organizationService.isUserOrganizationMember(
      currentUser.id,
      organizationId
    );
    
    if (!isMember) {
      return NextResponse.json(
        { error: 'You do not have access to this organization' },
        { status: 403 }
      );
    }

    // Verify knowledge base belongs to organization
    const knowledgeBase = await db.knowledgeBase.findUnique({
      where: {
        id: kbId,
        organizationId,
      },
    });

    if (!knowledgeBase) {
      return NextResponse.json(
        { error: 'Knowledge base not found' },
        { status: 404 }
      );
    }

    const questions = await db.knowledgeBaseQuestion.findMany({
      where: {
        knowledgeBaseId: kbId,
      },
      include: {
        answer: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}

// Create a new question
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; kbId: string }> }
) {
  try {
    const { id, kbId } = await params;
    const organizationId = id;
    const { text, topic, tags, answer } = await request.json();

    const currentUser = await organizationService.getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check if user has permissions
    const userRole = await organizationService.getUserOrganizationRole(
      currentUser.id,
      organizationId
    );
    
    if (!userRole || !['admin', 'owner', 'member'].includes(userRole)) {
      return NextResponse.json(
        { error: 'You do not have permission to create questions' },
        { status: 403 }
      );
    }

    // Verify knowledge base belongs to organization
    const knowledgeBase = await db.knowledgeBase.findUnique({
      where: {
        id: kbId,
        organizationId,
      },
    });

    if (!knowledgeBase) {
      return NextResponse.json(
        { error: 'Knowledge base not found' },
        { status: 404 }
      );
    }

    // Create question and answer in a transaction
    const result = await db.$transaction(async (tx) => {
      const question = await tx.knowledgeBaseQuestion.create({
        data: {
          text,
          topic,
          tags: tags || [],
          knowledgeBaseId: kbId,
        },
      });

      let answerRecord = null;
      if (answer) {
        answerRecord = await tx.knowledgeBaseAnswer.create({
          data: {
            text: answer,
            questionId: question.id,
          },
        });
      }

      return { question, answer: answerRecord };
    });

    const questionWithAnswer = await db.knowledgeBaseQuestion.findUnique({
      where: { id: result.question.id },
      include: { answer: true },
    });

    return NextResponse.json(questionWithAnswer);
  } catch (error) {
    console.error('Error creating question:', error);
    return NextResponse.json(
      { error: 'Failed to create question' },
      { status: 500 }
    );
  }
}
