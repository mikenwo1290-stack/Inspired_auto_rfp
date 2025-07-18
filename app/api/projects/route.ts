import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Helper function to transform contract data for projects response
function transformContractForProject(contract: any) {
  return {
    id: contract.id,
    title: contract.title,
    vendor: contract.vendor,
    contract_value: contract.contractValue,
    start_date: contract.startDate,
    end_date: contract.endDate,
    created_at: contract.createdAt,
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');

    const where = organizationId ? { organizationId } : {};

    const projects = await db.project.findMany({
      where,
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          }
        },
      },
      orderBy: {
        createdAt: 'desc'
      }
    });


    return NextResponse.json({
      success: true,
      data: projects
    });
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch projects',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, organizationId } = body;

    // Validate required fields
    if (!name || !organizationId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Name and organization ID are required'
        },
        { status: 400 }
      );
    }

    // Verify organization exists
    const organization = await db.organization.findUnique({
      where: { id: organizationId }
    });

    if (!organization) {
      return NextResponse.json(
        {
          success: false,
          error: 'Organization not found'
        },
        { status: 404 }
      );
    }

    const project = await db.project.create({
      data: {
        name,
        description,
        organizationId,
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          }
        },
      }
    });
    return NextResponse.json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Failed to create project:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create project',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 