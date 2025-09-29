import { db } from "@/lib/db";
import { organizationService } from "@/lib/organization-service";

interface TemplateMetadata {
  requiredTags?: string[];
  description?: string;
}

export const proposalTemplateService = {
  async listTemplates(organizationId: string) {
    return db.proposalTemplate.findMany({
      where: { organizationId },
      orderBy: { uploadedAt: "desc" },
      select: {
        id: true,
        name: true,
        uploadedAt: true,
        uploadedBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
  },

  async getTemplate(templateId: string, organizationId?: string) {
    return db.proposalTemplate.findFirst({
      where: {
        id: templateId,
        ...(organizationId ? { organizationId } : {}),
      },
    });
  },

  async createTemplate(params: {
    organizationId: string;
    userId: string;
    name: string;
    description?: string | null;
    fileKey: string;
    fileSize: number;
    mimeType: string;
    metadata?: TemplateMetadata | null;
  }) {
    const { organizationId, userId, metadata, ...data } = params;

    const canManage = await organizationService.canManageOrganization(userId, organizationId);
    if (!canManage) {
      throw new Error("You do not have permission to upload templates for this organization.");
    }

    return db.proposalTemplate.create({
      data: {
        ...data,
        organizationId,
        uploadedById: userId,
        metadata: metadata ?? undefined,
      },
    });
  },
};

