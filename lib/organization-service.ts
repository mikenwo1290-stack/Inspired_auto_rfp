import { db } from './db';
import { createClient } from '@/lib/utils/supabase/server';

export const organizationService = {
  // Organization operations
  async createOrganization(name: string, description: string | null = null, userId: string) {
    // Create a slug from the name (lowercase, replace spaces with dashes, remove special chars)
    const slug = name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-')
      .substring(0, 50); // Limit length

    // Make the slug unique by adding a random suffix if needed
    let uniqueSlug = slug;
    let slugExists = await db.organization.findUnique({
      where: { slug: uniqueSlug },
    });

    if (slugExists) {
      uniqueSlug = `${slug}-${Math.random().toString(36).substring(2, 7)}`;
    }

    // Create the organization and add the user as an owner in a transaction
    return db.$transaction(async (tx) => {
      // Create the organization
      const organization = await tx.organization.create({
        data: {
          name,
          slug: uniqueSlug,
          description,
        },
      });

      // Add the user as an owner
      await tx.organizationUser.create({
        data: {
          role: 'owner',
          userId,
          organizationId: organization.id,
        },
      });

      return organization;
    });
  },

  async getOrganization(id: string) {
    return db.organization.findUnique({
      where: { id },
      include: {
        projects: {
          orderBy: {
            updatedAt: 'desc',
          },
        },
        organizationUsers: {
          include: {
            user: true,
          },
        },
      },
    });
  },

  async getOrganizationBySlug(slug: string) {
    return db.organization.findUnique({
      where: { slug },
      include: {
        projects: {
          orderBy: {
            updatedAt: 'desc',
          },
        },
        organizationUsers: {
          include: {
            user: true,
          },
        },
      },
    });
  },

  async getUserOrganizations(userId: string) {
    return db.organization.findMany({
      where: {
        organizationUsers: {
          some: {
            userId,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  },

  async updateOrganization(id: string, data: { name?: string; description?: string }) {
    return db.organization.update({
      where: { id },
      data,
    });
  },

  async deleteOrganization(id: string) {
    return db.organization.delete({
      where: { id },
    });
  },

  // Organization members operations
  async addUserToOrganization(organizationId: string, email: string, role: string = 'member') {
    // First check if the user exists
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error(`User with email ${email} not found`);
    }

    // Then create the organization user
    return db.organizationUser.create({
      data: {
        role,
        userId: user.id,
        organizationId,
      },
      include: {
        user: true,
      },
    });
  },

  async getOrganizationMembers(organizationId: string) {
    return db.organizationUser.findMany({
      where: {
        organizationId,
      },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  },

  async updateMemberRole(organizationId: string, userId: string, role: string) {
    return db.organizationUser.update({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
      data: {
        role,
      },
    });
  },

  async removeMember(organizationId: string, userId: string) {
    return db.organizationUser.delete({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
    });
  },

  // User methods
  async createUserIfNotExists(id: string, email: string, name: string | null = null) {
    const user = await db.user.findUnique({
      where: { id },
    });

    if (user) {
      return user;
    }

    return db.user.create({
      data: {
        id,
        email,
        name,
      },
    });
  },

  async getCurrentUser() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    // Ensure user exists in our database
    const dbUser = await this.createUserIfNotExists(
      user.id,
      user.email || '',
      user.user_metadata?.name || null
    );

    return dbUser;
  },

  async getUserOrganizationRole(userId: string, organizationId: string) {
    const orgUser = await db.organizationUser.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
    });

    return orgUser?.role || null;
  },

  async isUserOrganizationMember(userId: string, organizationId: string) {
    const orgUser = await db.organizationUser.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
    });

    return !!orgUser;
  },
}; 