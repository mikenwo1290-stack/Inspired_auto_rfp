import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { organizationService } from '@/lib/organization-service';

export async function POST(request: NextRequest) {
  try {
    const { organizationId } = await request.json();
    const currentUser = await organizationService.getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      );
    }
    
    // Check if user has admin access to this organization
    const userRole = await organizationService.getUserOrganizationRole(
      currentUser.id,
      organizationId
    );
    
    if (!userRole || (userRole !== 'owner' && userRole !== 'admin')) {
      return NextResponse.json(
        { error: 'Only organization owners and admins can disconnect from LlamaCloud' },
        { status: 403 }
      );
    }

    // Remove the LlamaCloud connection info from the database
    const updatedOrganization = await db.organization.update({
      where: { id: organizationId },
      data: {
        llamaCloudApiKey: null,
        llamaCloudProjectId: null,
        llamaCloudProjectName: null,
        llamaCloudConnectedAt: null,
      },
    });

    return NextResponse.json({ 
      success: true,
      message: 'Successfully disconnected from LlamaCloud',
      organization: updatedOrganization,
    });
  } catch (error) {
    console.error('Error disconnecting from LlamaCloud:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect from LlamaCloud' },
      { status: 500 }
    );
  }
} 