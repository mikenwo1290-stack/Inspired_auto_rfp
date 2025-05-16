import { NextRequest, NextResponse } from 'next/server';
import { organizationService } from '@/lib/organization-service';
import { OrganizationUser } from '@/types/organization';

// Update a member's role
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const { id: organizationId, userId } = await params;
    const { role } = await request.json();
    const currentUser = await organizationService.getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check if current user has permission (admin or owner)
    const currentUserRole = await organizationService.getUserOrganizationRole(
      currentUser.id,
      organizationId
    );
    
    if (!currentUserRole || !['admin', 'owner'].includes(currentUserRole)) {
      return NextResponse.json(
        { error: 'You do not have permission to update member roles' },
        { status: 403 }
      );
    }
    
    // Only owners can update admin roles
    if (role === 'owner' && currentUserRole !== 'owner') {
      return NextResponse.json(
        { error: 'Only owners can promote members to owners' },
        { status: 403 }
      );
    }
    
    // Check the current role of the target user
    const targetUserRole = await organizationService.getUserOrganizationRole(
      userId,
      organizationId
    );
    
    // Prevent demoting the last owner
    if (targetUserRole === 'owner') {
      const members = await organizationService.getOrganizationMembers(organizationId);
      const ownerCount = members.filter(m => m.role === 'owner').length;
      
      if (ownerCount === 1 && role !== 'owner') {
        return NextResponse.json(
          { error: 'Cannot demote the last owner of the organization' },
          { status: 400 }
        );
      }
    }
    
    const updatedMember = await organizationService.updateMemberRole(
      organizationId,
      userId,
      role
    );
    
    return NextResponse.json(updatedMember);
  } catch (error) {
    console.error('Error updating member role:', error);
    return NextResponse.json(
      { error: 'Failed to update member role' },
      { status: 500 }
    );
  }
}

// Remove a member from the organization
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const { id: organizationId, userId } = await params;
    const currentUser = await organizationService.getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check if current user has permission (admin or owner)
    const currentUserRole = await organizationService.getUserOrganizationRole(
      currentUser.id,
      organizationId
    );
    
    if (!currentUserRole || !['admin', 'owner'].includes(currentUserRole)) {
      return NextResponse.json(
        { error: 'You do not have permission to remove members' },
        { status: 403 }
      );
    }
    
    // Check the current role of the target user
    const targetUserRole = await organizationService.getUserOrganizationRole(
      userId,
      organizationId
    );
    
    // Admins can't remove owners
    if (targetUserRole === 'owner' && currentUserRole !== 'owner') {
      return NextResponse.json(
        { error: 'Only owners can remove other owners' },
        { status: 403 }
      );
    }
    
    // Prevent removing the last owner
    if (targetUserRole === 'owner') {
      const members = await organizationService.getOrganizationMembers(organizationId);
      const ownerCount = members.filter(m => m.role === 'owner').length;
      
      if (ownerCount === 1) {
        return NextResponse.json(
          { error: 'Cannot remove the last owner of the organization' },
          { status: 400 }
        );
      }
    }
    
    // Users can leave organizations (remove themselves)
    const isSelf = userId === currentUser.id;
    
    if (isSelf) {
      // If this is the last owner, prevent leaving
      if (targetUserRole === 'owner') {
        const members = await organizationService.getOrganizationMembers(organizationId);
        const ownerCount = members.filter(m => m.role === 'owner').length;
        
        if (ownerCount === 1) {
          return NextResponse.json(
            { error: 'As the last owner, you cannot leave the organization. Transfer ownership first.' },
            { status: 400 }
          );
        }
      }
    }
    
    await organizationService.removeMember(organizationId, userId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing member:', error);
    return NextResponse.json(
      { error: 'Failed to remove member' },
      { status: 500 }
    );
  }
} 