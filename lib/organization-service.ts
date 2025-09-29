import { db } from './db';
import { createClient } from '@/lib/utils/supabase/server';

// Simple in-memory cache for current user (lasts for the duration of request)
let currentUserCache: { user: any; timestamp: number } | null = null;
const CACHE_TTL = 60 * 1000; // 1 minute in milliseconds

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

  async getOrganization(id: string, includeRelations = false) {
    // Basic organization data without expensive relations
    if (!includeRelations) {
      return db.organization.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          createdAt: true,
          updatedAt: true,
          // Include LlamaCloud connection fields
          llamaCloudProjectId: true,
          llamaCloudProjectName: true,
          llamaCloudConnectedAt: true,
        }
      });
    }
    
    // Full organization data with relations when explicitly requested
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

  async getOrganizationBySlug(slug: string, includeRelations = false) {
    // Basic organization data without expensive relations
    if (!includeRelations) {
      return db.organization.findUnique({
        where: { slug },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          createdAt: true,
          updatedAt: true,
          // Include LlamaCloud connection fields
          llamaCloudProjectId: true,
          llamaCloudProjectName: true,
          llamaCloudConnectedAt: true,
        }
      });
    }

    // Full organization data with relations when explicitly requested
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
    // First check if user exists by ID (primary check)
    const existingUserById = await db.user.findUnique({
      where: { id },
    });

    if (existingUserById) {
      return existingUserById;
    }

    // Then check if user exists by email (to prevent unique constraint violation)
    const existingUserByEmail = await db.user.findUnique({
      where: { email },
    });

    if (existingUserByEmail) {
      // User exists with same email but different ID - this shouldn't happen in normal Supabase flow
      // but if it does, we should return the existing user to avoid constraint violation
      console.warn(`User with email ${email} already exists with different ID. Existing: ${existingUserByEmail.id}, Requested: ${id}`);
      return existingUserByEmail;
    }

    // User doesn't exist by either ID or email, safe to create
    try {
      return await db.user.create({
        data: {
          id,
          email,
          name,
        },
      });
    } catch (error) {
      // Handle race condition: if user was created between our checks and create attempt
      const raceConditionUser = await db.user.findUnique({
        where: { email },
      });
      
      if (raceConditionUser) {
        return raceConditionUser;
      }
      
      // If it's not a race condition, re-throw the error
      throw error;
    }
  },

  async getCurrentUser() {
    // Check if we have a valid cached user
    const now = Date.now();
    if (currentUserCache && (now - currentUserCache.timestamp < CACHE_TTL)) {
      return currentUserCache.user;
    }

    // No cache or expired cache, fetch the user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      currentUserCache = null;
      return null;
    }

    // Ensure user exists in our database
    const dbUser = await this.createUserIfNotExists(
      user.id,
      user.email || '',
      user.user_metadata?.name || null
    );

    // Cache the user for subsequent calls
    currentUserCache = { user: dbUser, timestamp: now };
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
      select: {
        role: true
      }
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

  async canManageOrganization(userId: string, organizationId: string) {
    const orgUser = await db.organizationUser.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
      select: {
        role: true,
      },
    });

    if (!orgUser) {
      return false;
    }

    return ["owner", "admin"].includes(orgUser.role);
  },

  // Knowledge base operations
  async listKnowledgeBases(organizationId: string) {
    return db.knowledgeBase.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });
  },

  async createKnowledgeBase(
    organizationId: string,
    data: { name: string; description?: string | null; [key: string]: unknown }
  ) {
    const { name, description } = data;
    return db.knowledgeBase.create({
      data: {
        name,
        description: description ?? null,
        organizationId,
      },
    });
  },

  async getKnowledgeBase(
    organizationId: string,
    knowledgeBaseId: string,
    options?: { includeQuestions?: boolean }
  ) {
    const includeQuestions = options?.includeQuestions === true;
    return db.knowledgeBase.findFirst({
      where: { id: knowledgeBaseId, organizationId },
      include: includeQuestions
        ? {
            questions: {
              include: {
                answer: true,
              },
              orderBy: { createdAt: 'desc' },
            },
          }
        : undefined,
    });
  },

  async updateKnowledgeBase(
    organizationId: string,
    knowledgeBaseId: string,
    data: { name?: string; description?: string | null }
  ) {
    const existing = await db.knowledgeBase.findFirst({
      where: { id: knowledgeBaseId, organizationId },
      select: { id: true },
    });
    if (!existing) {
      return null;
    }
    return db.knowledgeBase.update({
      where: { id: knowledgeBaseId },
      data,
    });
  },

  async deleteKnowledgeBase(organizationId: string, knowledgeBaseId: string) {
    const existing = await db.knowledgeBase.findFirst({
      where: { id: knowledgeBaseId, organizationId },
      select: { id: true },
    });
    if (!existing) {
      return null;
    }
    return db.knowledgeBase.delete({ where: { id: knowledgeBaseId } });
  },

  // Knowledge base question operations
  async listKnowledgeBaseQuestions(organizationId: string, knowledgeBaseId: string) {
    return db.knowledgeBaseQuestion.findMany({
      where: {
        knowledgeBaseId,
        knowledgeBase: { organizationId },
      },
      include: { answer: true },
      orderBy: { createdAt: 'desc' },
    });
  },

  async createKnowledgeBaseQuestion(
    organizationId: string,
    knowledgeBaseId: string,
    data: { text: string; topic?: string | null; tags?: string[]; [key: string]: unknown }
  ) {
    const kb = await db.knowledgeBase.findFirst({
      where: { id: knowledgeBaseId, organizationId },
      select: { id: true },
    });
    if (!kb) {
      throw new Error('Knowledge base not found');
    }
    const { text, topic, tags } = data;
    return db.knowledgeBaseQuestion.create({
      data: {
        text,
        topic: topic ?? null,
        tags: tags ?? [],
        knowledgeBaseId,
      },
    });
  },

  async getKnowledgeBaseQuestion(
    organizationId: string,
    knowledgeBaseId: string,
    questionId: string
  ) {
    return db.knowledgeBaseQuestion.findFirst({
      where: {
        id: questionId,
        knowledgeBaseId,
        knowledgeBase: { organizationId },
      },
      include: { answer: true },
    });
  },

  async updateKnowledgeBaseQuestion(
    organizationId: string,
    knowledgeBaseId: string,
    questionId: string,
    data: { text?: string; topic?: string | null; tags?: string[] }
  ) {
    const existing = await db.knowledgeBaseQuestion.findFirst({
      where: {
        id: questionId,
        knowledgeBaseId,
        knowledgeBase: { organizationId },
      },
      select: { id: true },
    });
    if (!existing) {
      return null;
    }
    return db.knowledgeBaseQuestion.update({
      where: { id: questionId },
      data,
    });
  },

  async deleteKnowledgeBaseQuestion(
    organizationId: string,
    knowledgeBaseId: string,
    questionId: string
  ) {
    const existing = await db.knowledgeBaseQuestion.findFirst({
      where: {
        id: questionId,
        knowledgeBaseId,
        knowledgeBase: { organizationId },
      },
      select: { id: true },
    });
    if (!existing) {
      return null;
    }
    return db.knowledgeBaseQuestion.delete({ where: { id: questionId } });
  },
}; 