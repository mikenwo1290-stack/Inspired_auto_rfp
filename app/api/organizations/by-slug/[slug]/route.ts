import { NextRequest, NextResponse } from 'next/server';
import { organizationService } from '@/lib/organization-service';

// Get organization by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {

  console.log("request is ", request);
  try {

    const { slug } = await params;
    console.log("slug is ", slug);


    const currentUser = await organizationService.getCurrentUser();

    console.log("currentUser is ", currentUser);
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log("fetching organization by slug");
    
    const organization = await organizationService.getOrganizationBySlug(slug,true);

    console.log("organization is ", organization);
    
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

    console.log("isMember is ", isMember);
    if (!isMember) {
      return NextResponse.json(
        { error: 'You do not have access to this organization' },
        { status: 403 }
      );
    }

    console.log("returning organization");
    
    return NextResponse.json(organization);
  } catch (error) {
    console.error('Error fetching organization by slug:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organization' },
      { status: 500 }
    );
  }
} 