import { NextRequest, NextResponse } from 'next/server';
import { projectService } from '@/lib/project-service';
import { organizationService } from '@/lib/organization-service';
import { Organization } from '@/types/organization';

// Get all projects for the current user's organizations
export async function GET(request: NextRequest) {
  try {
    const currentUser = await organizationService.getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get the organization ID from the query params, if provided
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    
    // If organization ID is provided, get projects for that organization
    // Otherwise, get projects for all organizations the user is a member of
    let projects;
    
    if (organizationId) {
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
      
      projects = await projectService.getProjects(organizationId);
    } else {
      // Get all organizations the user is a member of
      const organizations = await organizationService.getUserOrganizations(currentUser.id);
      
      // Get projects for each organization
      const projectPromises = organizations.map((org) => 
        projectService.getProjects(org.id)
      );
      
      const orgProjects = await Promise.all(projectPromises);
      projects = orgProjects.flat();
    }
    
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

// Create a new project
export async function POST(request: NextRequest) {
  try {
    const { name, description, organizationId } = await request.json();
    const currentUser = await organizationService.getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 }
      );
    }
    
    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
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

    const project = await projectService.createProject(name, organizationId, description);
    return NextResponse.json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
} 