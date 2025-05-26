import { z } from 'zod';

// Connect request validation schema
export const LlamaCloudConnectRequestSchema = z.object({
  organizationId: z.string().min(1, 'Organization ID is required'),
  apiKey: z.string().min(1, 'API key is required'),
  projectId: z.string().min(1, 'Project ID is required'),
  projectName: z.string().min(1, 'Project name is required'),
  llamaCloudOrgName: z.string().optional(),
});

// Disconnect request validation schema
export const LlamaCloudDisconnectRequestSchema = z.object({
  organizationId: z.string().min(1, 'Organization ID is required'),
});

// LlamaCloud project schema (from API response)
export const LlamaCloudProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

// Connect response validation schema
export const LlamaCloudConnectResponseSchema = z.object({
  success: z.boolean(),
  organization: z.object({
    id: z.string(),
    name: z.string(),
    llamaCloudApiKey: z.string().nullable(),
    llamaCloudProjectId: z.string().nullable(),
    llamaCloudProjectName: z.string().nullable(),
    llamaCloudOrgName: z.string().nullable(),
    llamaCloudConnectedAt: z.date().nullable(),
  }),
});

// Disconnect response validation schema
export const LlamaCloudDisconnectResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  organization: z.object({
    id: z.string(),
    name: z.string(),
    llamaCloudApiKey: z.null(),
    llamaCloudProjectId: z.null(),
    llamaCloudProjectName: z.null(),
    llamaCloudConnectedAt: z.null(),
  }),
});

// Documents request validation schema (for query parameters)
export const LlamaCloudDocumentsRequestSchema = z.object({
  organizationId: z.string().min(1, 'Organization ID is required'),
});

// LlamaCloud pipeline schema
export const LlamaCloudPipelineSchema = z.object({
  id: z.string(),
  name: z.string(),
  project_id: z.string(),
  description: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  status: z.string().optional(),
});

// LlamaCloud file/document schema
export const LlamaCloudFileSchema = z.object({
  id: z.string().optional(),
  file_name: z.string(),
  name: z.string().optional(),
  status: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  file_size: z.number().optional(),
  size_bytes: z.number().optional(),
  pipelineName: z.string().optional(),
  pipelineId: z.string().optional(),
});

// Documents response validation schema
export const LlamaCloudDocumentsResponseSchema = z.object({
  projectName: z.string().nullable(),
  projectId: z.string().nullable(),
  pipelines: z.array(LlamaCloudPipelineSchema),
  documents: z.array(LlamaCloudFileSchema),
  connectedAt: z.date().nullable(),
});

// Type exports
export type LlamaCloudConnectRequest = z.infer<typeof LlamaCloudConnectRequestSchema>;
export type LlamaCloudDisconnectRequest = z.infer<typeof LlamaCloudDisconnectRequestSchema>;
export type LlamaCloudProject = z.infer<typeof LlamaCloudProjectSchema>;
export type LlamaCloudConnectResponse = z.infer<typeof LlamaCloudConnectResponseSchema>;
export type LlamaCloudDisconnectResponse = z.infer<typeof LlamaCloudDisconnectResponseSchema>;

// Additional type exports
export type LlamaCloudDocumentsRequest = z.infer<typeof LlamaCloudDocumentsRequestSchema>;
export type LlamaCloudPipeline = z.infer<typeof LlamaCloudPipelineSchema>;
export type LlamaCloudFile = z.infer<typeof LlamaCloudFileSchema>;
export type LlamaCloudDocumentsResponse = z.infer<typeof LlamaCloudDocumentsResponseSchema>; 