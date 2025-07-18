import { NextRequest, NextResponse } from 'next/server';
import { organizationService } from '@/lib/organization-service';

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

    const role = await organizationService.getUserOrganizationRole(
      currentUser.id,
      organizationId
    );

    if (!role) {
      return NextResponse.json(
        { error: 'User is not a member of this organization' },
        { status: 403 }
      );
    }

    return NextResponse.json({ 
      role,
      userId: currentUser.id
    });
  } catch (error) {
    console.error('Error getting user role:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 