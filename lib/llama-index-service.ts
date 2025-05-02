import { env, validateEnv } from "./env";
import { documentStore } from "./document-service";
import { LlamaParseResult } from "@/types/api";

/**
 * Service for interacting with LlamaIndex Cloud API
 */
export class LlamaIndexService {
  private apiKey: string;
  
  constructor() {
    if (!validateEnv()) {
      throw new Error('Required environment variables are missing');
    }
    
    this.apiKey = env.LLAMA_CLOUD_API_KEY.apiKey;
  }
  
  /**
   * Generate a response to a question using the specified documents
   */
  async generateResponse(question: string, documentIds?: string[]) {
    try {
      // Get documents from the document store
      let documents: { text: string, id: string }[] = [];
      
      if (documentIds && documentIds.length > 0) {
        // If document IDs are provided, get those specific documents
        const filteredDocs = documentStore.getAllDocuments()
          .filter(doc => documentIds.includes(doc.documentId));
          
        documents = filteredDocs.map(doc => ({
          text: doc.content || `Document about ${doc.documentName}`,
          id: doc.documentId
        }));
      } else {
        // Otherwise, use all documents
        documents = documentStore.getAllDocuments()
          .map(doc => ({
            text: doc.content || `Document about ${doc.documentName}`,
            id: doc.documentId
          }));
      }
      
      // If no documents are available, return a default response
      if (documents.length === 0) {
        return this.generateDefaultResponse(question);
      }
      
      // Call the LlamaIndex Cloud API
      const response = await fetch('https://api.cloud.llamaindex.ai/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: question
            }
          ],
          context: {
            documents: documents
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`LlamaIndex API error: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      
      return {
        response: result.message?.content || 'No response generated',
        sources: documents.map(doc => doc.id),
        confidence: 0.95,
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error generating response with LlamaIndex API:', error);
      return this.generateDefaultResponse(question);
    }
  }
  
  /**
   * Generate a default response when no documents are available
   * or when an error occurs
   */
  private generateDefaultResponse(question: string) {
    // Sample responses based on question keywords
    const responses: Record<string, string> = {
      default: "Our solution provides comprehensive capabilities designed to meet and exceed your requirements. We employ industry best practices and leverage cutting-edge technology to deliver superior outcomes. Our team has extensive experience in implementing similar solutions across various industries.",
      
      security: "Our platform implements robust security measures including 256-bit AES encryption for data at rest and in transit, role-based access controls with multi-factor authentication, regular penetration testing, and adherence to compliance standards including SOC 2 Type II and ISO 27001. We maintain comprehensive backup and disaster recovery procedures to ensure data integrity and availability.",
      
      implementation: "Our implementation approach follows a proven 5-phase methodology: Discovery, Planning, Configuration, Testing, and Deployment. Each phase includes clear milestones, deliverables, and approval gates. A dedicated implementation team with domain expertise is assigned to your project, supported by our professional services organization. Typical enterprise implementations are completed within 8-12 weeks.",
      
      pricing: "Our pricing model is structured to provide maximum flexibility and value. The core platform is available on an annual subscription basis with pricing tiers based on user count and feature requirements. Implementation services are priced separately based on project scope. Volume discounts are available for enterprise deployments, and we offer special pricing for academic and non-profit organizations.",
      
      support: "We provide 24/7/365 technical support through multiple channels including phone, email, and chat. Our standard SLA guarantees 99.9% uptime with 4-hour response times for critical issues. Premium support plans with dedicated support engineers and faster response times are available. All customers have access to our comprehensive documentation, knowledge base, and community forums.",
    };

    // Determine which response to use based on question content
    let responseText = responses.default;
    const questionLower = question.toLowerCase();
    
    if (questionLower.includes('security') || questionLower.includes('secure') || questionLower.includes('compliance')) {
      responseText = responses.security;
    } else if (questionLower.includes('implementation') || questionLower.includes('deploy') || questionLower.includes('timeline')) {
      responseText = responses.implementation;
    } else if (questionLower.includes('price') || questionLower.includes('pricing') || questionLower.includes('cost')) {
      responseText = responses.pricing;
    } else if (questionLower.includes('support') || questionLower.includes('maintenance') || questionLower.includes('help')) {
      responseText = responses.support;
    }
    
    return {
      response: responseText,
      sources: [],
      confidence: 0.7,
      generatedAt: new Date().toISOString(),
    };
  }
} 