import { NextRequest, NextResponse } from 'next/server';
import { organizationService } from '@/lib/organization-service';

// Get organization by slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;
    const currentUser = await organizationService.getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const organization = await organizationService.getOrganizationBySlug(slug);
    
    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }
    
    // Check if user is a member of this organization
    const isMember = await organizationService.isUserOrganizationMember(
      currentUser.id,
      organization.id
    );
    
    if (!isMember) {
      return NextResponse.json(
        { error: 'You do not have access to this organization' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(organization);
  } catch (error) {
    console.error('Error fetching organization by slug:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organization' },
      { status: 500 }
    );
  }
} 