import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { organizationService } from '@/lib/organization-service';

export async function GET() {


  try {

    const currentUser = await organizationService.getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }

    const organizations = await db.organization.findMany({
      where: {
        organizationUsers: {
          some: {
            userId: currentUser.id
          }
        }
      },
      include: {
        organizationUsers: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              }
            }
          }
        },
        projects: {
          select: {
            id: true,
            name: true,
            description: true,
            createdAt: true,
          }
        },
        _count: {
          select: {
            projects: true,
            organizationUsers: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: organizations
    });
  } catch (error) {
    console.error('Failed to fetch organizations:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch organizations',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, slug, description, aiProcessingEnabled, autoApprovalThreshold } = body;

    // Validate required fields
    if (!name || !slug) {
      return NextResponse.json(
        {
          success: false,
          error: 'Name and slug are required'
        },
        { status: 400 }
      );
    }

    // Check if slug is unique
    const existingOrg = await db.organization.findUnique({
      where: { slug }
    });

    if (existingOrg) {
      return NextResponse.json(
        {
          success: false,
          error: 'Organization slug already exists'
        },
        { status: 409 }
      );
    }

    const organization = await db.organization.create({
      data: {
        name,
        slug,
        description,
      },
      include: {
        organizationUsers: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              }
            }
          }
        },
        projects: true,
        _count: {
          select: {
            projects: true,
            organizationUsers: true,
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: organization
    });
  } catch (error) {
    console.error('Failed to create organization:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create organization',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 