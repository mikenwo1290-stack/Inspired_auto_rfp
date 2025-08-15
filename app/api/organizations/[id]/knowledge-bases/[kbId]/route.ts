import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { organizationService } from '@/lib/organization-service';

// Get specific knowledge base
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

    const knowledgeBase = await db.knowledgeBase.findUnique({
      where: {
        id: kbId,
        organizationId,
      },
      include: {
        questions: {
          include: {
            answer: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            questions: true,
          },
        },
      },
    });

    if (!knowledgeBase) {
      return NextResponse.json(
        { error: 'Knowledge base not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(knowledgeBase);
  } catch (error) {
    console.error('Error fetching knowledge base:', error);
    return NextResponse.json(
      { error: 'Failed to fetch knowledge base' },
      { status: 500 }
    );
  }
}

// Update knowledge base
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; kbId: string }> }
) {
  try {
    const { id, kbId } = await params;
    const organizationId = id;
    const { name, description } = await request.json();

    const currentUser = await organizationService.getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check if user has admin/owner permissions
    const userRole = await organizationService.getUserOrganizationRole(
      currentUser.id,
      organizationId
    );
    
    if (!userRole || !['admin', 'owner'].includes(userRole)) {
      return NextResponse.json(
        { error: 'You do not have permission to update knowledge bases' },
        { status: 403 }
      );
    }

    const knowledgeBase = await db.knowledgeBase.update({
      where: {
        id: kbId,
        organizationId,
      },
      data: {
        name,
        description,
      },
      include: {
        _count: {
          select: {
            questions: true,
          },
        },
      },
    });

    return NextResponse.json(knowledgeBase);
  } catch (error) {
    console.error('Error updating knowledge base:', error);
    return NextResponse.json(
      { error: 'Failed to update knowledge base' },
      { status: 500 }
    );
  }
}

// Delete knowledge base
export async function DELETE(
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
    
    // Check if user has admin/owner permissions
    const userRole = await organizationService.getUserOrganizationRole(
      currentUser.id,
      organizationId
    );
    
    if (!userRole || !['admin', 'owner'].includes(userRole)) {
      return NextResponse.json(
        { error: 'You do not have permission to delete knowledge bases' },
        { status: 403 }
      );
    }

    await db.knowledgeBase.delete({
      where: {
        id: kbId,
        organizationId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting knowledge base:', error);
    return NextResponse.json(
      { error: 'Failed to delete knowledge base' },
      { status: 500 }
    );
  }
}
