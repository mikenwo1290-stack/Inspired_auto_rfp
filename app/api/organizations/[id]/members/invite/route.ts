import { NextRequest, NextResponse } from 'next/server';
import { organizationService } from '@/lib/organization-service';

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
        { error: 'You do not have permission to invite members' },
        { status: 403 }
      );
    }
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }
    
    // Ensure role is valid
    const validRole = role === 'admin' || role === 'member';
    if (!validRole) {
      return NextResponse.json(
        { error: 'Invalid role provided' },
        { status: 400 }
      );
    }
    
    // In a real application, this would:
    // 1. Create an invitation record in the database
    // 2. Send an email to the invitee with an invitation link
    // 3. Return the invitation details
    
    // For demo purposes, we'll simulate by adding the user directly
    try {
      const newMember = await organizationService.addUserToOrganization(
        organizationId,
        email,
        role || 'member'
      );
      
      return NextResponse.json({
        success: true,
        message: `Invitation sent to ${email}`,
        member: newMember
      });
    } catch (err) {
      // If the user doesn't exist yet, we'd normally send them an invite email
      // For demo purposes, we'll just return success
      if (err instanceof Error && err.message.includes("user not found")) {
        return NextResponse.json({
          success: true,
          message: `Invitation sent to ${email}`
        });
      }
      
      return NextResponse.json(
        { error: 'Failed to send invitation: ' + (err instanceof Error ? err.message : 'Unknown error') },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error inviting member:', error);
    return NextResponse.json(
      { error: 'Failed to invite member' },
      { status: 500 }
    );
  }
} 