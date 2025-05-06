import { RfpDocument } from '@/types/api';

// In a real app, this would be a database
// This cache will be lost on server restart
export const questionsCache = new Map<string, RfpDocument>(); 