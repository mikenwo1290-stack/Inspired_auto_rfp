import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { organizationService } from '@/lib/organization-service';

// Get specific question
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; kbId: string; questionId: string }> }
) {
  try {
    const { id, kbId, questionId } = await params;
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

    const question = await db.knowledgeBaseQuestion.findFirst({
      where: {
        id: questionId,
        knowledgeBase: {
          id: kbId,
          organizationId,
        },
      },
      include: {
        answer: true,
        knowledgeBase: true,
      },
    });

    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(question);
  } catch (error) {
    console.error('Error fetching question:', error);
    return NextResponse.json(
      { error: 'Failed to fetch question' },
      { status: 500 }
    );
  }
}

// Update question
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; kbId: string; questionId: string }> }
) {
  try {
    const { id, kbId, questionId } = await params;
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
        { error: 'You do not have permission to update questions' },
        { status: 403 }
      );
    }

    // Verify question belongs to the knowledge base and organization
    const existingQuestion = await db.knowledgeBaseQuestion.findFirst({
      where: {
        id: questionId,
        knowledgeBase: {
          id: kbId,
          organizationId,
        },
      },
      include: {
        answer: true,
      },
    });

    if (!existingQuestion) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    // Update question and answer in a transaction
    const result = await db.$transaction(async (tx) => {
      // Update question
      const updatedQuestion = await tx.knowledgeBaseQuestion.update({
        where: { id: questionId },
        data: {
          text,
          topic,
          tags: tags || [],
        },
      });

      // Handle answer update/creation/deletion
      if (answer) {
        if (existingQuestion.answer) {
          // Update existing answer
          await tx.knowledgeBaseAnswer.update({
            where: { questionId },
            data: { text: answer },
          });
        } else {
          // Create new answer
          await tx.knowledgeBaseAnswer.create({
            data: {
              text: answer,
              questionId,
            },
          });
        }
      } else if (existingQuestion.answer) {
        // Delete existing answer if no answer provided
        await tx.knowledgeBaseAnswer.delete({
          where: { questionId },
        });
      }

      return updatedQuestion;
    });

    // Fetch updated question with answer
    const questionWithAnswer = await db.knowledgeBaseQuestion.findUnique({
      where: { id: questionId },
      include: { answer: true },
    });

    return NextResponse.json(questionWithAnswer);
  } catch (error) {
    console.error('Error updating question:', error);
    return NextResponse.json(
      { error: 'Failed to update question' },
      { status: 500 }
    );
  }
}

// Delete question
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; kbId: string; questionId: string }> }
) {
  try {
    const { id, kbId, questionId } = await params;
    const organizationId = id;

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
        { error: 'You do not have permission to delete questions' },
        { status: 403 }
      );
    }

    // Verify question belongs to the knowledge base and organization
    const existingQuestion = await db.knowledgeBaseQuestion.findFirst({
      where: {
        id: questionId,
        knowledgeBase: {
          id: kbId,
          organizationId,
        },
      },
    });

    if (!existingQuestion) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    // Delete question (cascade will handle answer deletion)
    await db.knowledgeBaseQuestion.delete({
      where: { id: questionId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting question:', error);
    return NextResponse.json(
      { error: 'Failed to delete question' },
      { status: 500 }
    );
  }
}
