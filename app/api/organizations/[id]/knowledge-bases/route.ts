import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { organizationService } from '@/lib/organization-service';

// Get all knowledge bases for an organization
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const knowledgeBases = await db.knowledgeBase.findMany({
      where: {
        organizationId,
      },
      include: {
        _count: {
          select: {
            questions: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(knowledgeBases);
  } catch (error) {
    console.error('Error fetching knowledge bases:', error);
    return NextResponse.json(
      { error: 'Failed to fetch knowledge bases' },
      { status: 500 }
    );
  }
}

// Create a new knowledge base
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
    
    if (!userRole || !['admin', 'owner', 'member'].includes(userRole)) {
      return NextResponse.json(
        { error: 'You do not have permission to create knowledge bases' },
        { status: 403 }
      );
    }

    const knowledgeBase = await db.knowledgeBase.create({
      data: {
        name,
        description,
        organizationId,
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
    console.error('Error creating knowledge base:', error);
    return NextResponse.json(
      { error: 'Failed to create knowledge base' },
      { status: 500 }
    );
  }
}
