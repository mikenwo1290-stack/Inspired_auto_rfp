import { NextRequest, NextResponse } from 'next/server';
import { organizationService } from '@/lib/organization-service';

// Get organization members
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
    
    const members = await organizationService.getOrganizationMembers(organizationId);
    
    return NextResponse.json(members);
  } catch (error) {
    console.error('Error fetching organization members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organization members' },
      { status: 500 }
    );
  }
}

// Add a new member to the organization
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const organizationId = id;
    const { email, role } = await request.json();
    const currentUser = await organizationService.getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check if user is an admin or owner
    const userRole = await organizationService.getUserOrganizationRole(
      currentUser.id,
      organizationId
    );
    
    if (!userRole || !['admin', 'owner'].includes(userRole)) {
      return NextResponse.json(
        { error: 'You do not have permission to add members' },
        { status: 403 }
      );
    }
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }
    
    try {
      const newMember = await organizationService.addUserToOrganization(
        organizationId,
        email,
        role || 'member'
      );
      
      return NextResponse.json(newMember);
    } catch (err) {
      return NextResponse.json(
        { error: 'Failed to add member: ' + (err instanceof Error ? err.message : 'Unknown error') },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error adding organization member:', error);
    return NextResponse.json(
      { error: 'Failed to add organization member' },
      { status: 500 }
    );
  }
} 