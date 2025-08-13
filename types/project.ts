export interface Project {
  id: string;
  name: string;
  description?: string;
  summary?: string; // RFP summary generated from uploaded documents
  eligibility?: string[]; // Vendor eligibility requirements as bullet points
  createdAt: string;
  progress?: number;
  status?: string;
} 