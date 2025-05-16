import { NextRequest, NextResponse } from 'next/server';
import { organizationService } from '@/lib/organization-service';

// Get all organizations for the current user
export async function GET() {
  try {
    const currentUser = await organizationService.getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const organizations = await organizationService.getUserOrganizations(currentUser.id);
    return NextResponse.json(organizations);
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organizations' },
      { status: 500 }
    );
  }
}

// Create a new organization
export async function POST(request: NextRequest) {
  try {
    const { name, description } = await request.json();
    const currentUser = await organizationService.getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { error: 'Organization name is required' },
        { status: 400 }
      );
    }

    const organization = await organizationService.createOrganization(
      name, 
      description || null,
      currentUser.id
    );
    
    return NextResponse.json(organization);
  } catch (error) {
    console.error('Error creating organization:', error);
    return NextResponse.json(
      { error: 'Failed to create organization' },
      { status: 500 }
    );
  }
} 