export interface Project {
  id: string;
  name: string;
  description?: string;
  summary?: string; // RFP summary generated from uploaded documents
  createdAt: string;
  progress?: number;
  status?: string;
} 