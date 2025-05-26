import { IOrganizationAuth } from '@/lib/interfaces/llamacloud-service';
import { organizationService } from '@/lib/organization-service';
import { AuthorizationError, ForbiddenError } from '@/lib/errors/api-errors';

/**
 * Organization authorization service implementation
 */
export class OrganizationAuth implements IOrganizationAuth {
  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<{ id: string } | null> {
    try {
      const user = await organizationService.getCurrentUser();
      return user;
    } catch (error) {
      // Return null if user is not authenticated instead of throwing
      return null;
    }
  }

  /**
   * Get user's role in an organization
   */
  async getUserOrganizationRole(userId: string, organizationId: string): Promise<string | null> {
    try {
      const role = await organizationService.getUserOrganizationRole(userId, organizationId);
      return role;
    } catch (error) {
      throw new AuthorizationError(
        `Failed to get user role: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Check if user has admin access to organization
   */
  async hasAdminAccess(userId: string, organizationId: string): Promise<boolean> {
    try {
      const role = await this.getUserOrganizationRole(userId, organizationId);
      return role === 'owner' || role === 'admin';
    } catch (error) {
      return false;
    }
  }

  /**
   * Verify user has admin access and throw if not
   */
  async requireAdminAccess(userId: string, organizationId: string): Promise<void> {
    const hasAccess = await this.hasAdminAccess(userId, organizationId);
    if (!hasAccess) {
      throw new ForbiddenError('Only organization owners and admins can perform this action');
    }
  }

  /**
   * Get authenticated user and verify admin access in one step
   */
  async getAuthenticatedAdminUser(organizationId: string): Promise<{ id: string }> {
    const user = await this.getCurrentUser();
    if (!user) {
      throw new AuthorizationError('Authentication required');
    }

    await this.requireAdminAccess(user.id, organizationId);
    return user;
  }

  /**
   * Check if user is a member of an organization
   */
  async isMemberOfOrganization(userId: string, organizationId: string): Promise<boolean> {
    try {
      return await organizationService.isUserOrganizationMember(userId, organizationId);
    } catch (error) {
      return false;
    }
  }

  /**
   * Verify user is a member and throw if not
   */
  async requireMembership(userId: string, organizationId: string): Promise<void> {
    const isMember = await this.isMemberOfOrganization(userId, organizationId);
    if (!isMember) {
      throw new ForbiddenError('You do not have access to this organization');
    }
  }

  /**
   * Get authenticated user and verify membership
   */
  async getAuthenticatedMember(organizationId: string): Promise<{ id: string }> {
    const user = await this.getCurrentUser();
    if (!user) {
      throw new AuthorizationError('Authentication required');
    }

    await this.requireMembership(user.id, organizationId);
    return user;
  }
}

// Export singleton instance
export const organizationAuth = new OrganizationAuth(); 