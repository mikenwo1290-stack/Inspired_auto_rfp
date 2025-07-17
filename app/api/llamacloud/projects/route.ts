import { NextRequest } from 'next/server';
import { apiHandler } from '@/lib/middleware/api-handler';
import { env, validateEnv } from '@/lib/env';

export async function GET(request: NextRequest) {
  return apiHandler(async () => {
    // Validate environment variables
    if (!validateEnv()) {
      return new Response(
        JSON.stringify({ error: 'LlamaCloud API key not configured in environment variables' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    try {
      // Fetch projects and organizations from LlamaCloud
      const [projectsResponse, organizationsResponse] = await Promise.all([
        fetch('https://api.cloud.llamaindex.ai/api/v1/projects', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${env.LLAMACLOUD_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }),
        fetch('https://api.cloud.llamaindex.ai/api/v1/organizations', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${env.LLAMACLOUD_API_KEY}`,
            'Content-Type': 'application/json',
          },
        })
      ]);

      if (!projectsResponse.ok) {
        if (projectsResponse.status === 401) {
          return new Response(
            JSON.stringify({ error: 'Invalid LlamaCloud API key' }),
            { status: 401, headers: { 'Content-Type': 'application/json' } }
          );
        }
        throw new Error('Failed to fetch projects from LlamaCloud');
      }

      const projects = await projectsResponse.json();
      const organizations = organizationsResponse.ok ? await organizationsResponse.json() : [];
      
      // Create a map of organization_id -> organization_name for quick lookup
      const orgMap = new Map();
      if (Array.isArray(organizations)) {
        organizations.forEach((org: any) => {
          orgMap.set(org.id, org.name);
        });
      }
      
      // Enhance projects with organization names
      const enhancedProjects = (projects || []).map((project: any) => ({
        ...project,
        organization_name: orgMap.get(project.organization_id) || 'Unknown Organization'
      }));
      
      return {
        success: true,
        projects: enhancedProjects,
      };
    } catch (error) {
      console.error('Error fetching LlamaCloud projects:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch projects from LlamaCloud' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  });
} 