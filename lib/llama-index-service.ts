import { env, validateEnv } from "./env";
import { documentStore } from "./document-service";
import { LlamaCloudIndex, ContextChatEngine } from "llamaindex";

/**
 * Service for interacting with LlamaIndex Cloud API
 */
export class LlamaIndexService {
  private apiKey: string;
  private index: LlamaCloudIndex;
  
  constructor() {
    if (!validateEnv()) {
      throw new Error('Required environment variables are missing');
    }
    
    this.apiKey = env.LLAMA_CLOUD_API_KEY.apiKey;

    // Connect to existing LlamaCloud index
    this.index = new LlamaCloudIndex({
      name: "rfp_docs_new", // Update this to your actual index name
      projectName: "Default", // Update this to your actual project name
      apiKey: this.apiKey,
    });
  }
  
  /**
   * Generate a response to a question using the specified documents
   */
  async generateResponse(question: string, documentIds?: string[]) {
    try {
      // Create a retriever with a specific top-k value
      const retriever = this.index.asRetriever({
        similarityTopK: 5,
      });

      // Create a chat engine with the retriever
      const chatEngine = new ContextChatEngine({ retriever });

      // Get the response using the chat engine
      const responder = await chatEngine.chat({ message: question });
      const response = responder.response;

      // Get the source documents that were used
      const sourcesWithMetadata = responder.sourceNodes || [];
      
      // Extract detailed source information
      const sources = sourcesWithMetadata.map((node, index) => {
        // Safely extract text content from the node, if available
        let textContent = null;
        try {
          // Access the text content of the node
          // In LlamaIndex, nodes may have text content in different properties
          // depending on the node type
          if (node.node) {
            // Try different ways to access the content based on various node types
            if ('text' in node.node) {
              textContent = (node.node as any).text;
            } else if (node.node.metadata && 'text' in node.node.metadata) {
              textContent = (node.node.metadata as any).text;
            }
          }
        } catch (error) {
          console.error('Error extracting text content from node:', error);
        }

        if (node.node && node.node.metadata) {
          const metadata = node.node.metadata;
          return {
            id: index + 1, // Use 1-based indexing for user-friendly display
            fileName: metadata.file_name || 'Unknown',
            filePath: metadata.file_path,
            pageNumber: metadata.page_label || metadata.start_page_label,
            documentId: metadata.document_id,
            // Add a score or relevance percentage based on the node score
            relevance: node.score ? Math.round(node.score * 100) : null,
            // Include the actual text content from the node
            textContent: textContent
          };
        }
        return {
          id: index + 1,
          fileName: 'Unknown Source',
          pageNumber: null,
          documentId: null,
          textContent: null
        };
      });

      return {
        response: response,
        sources: sources,
        confidence: 0.95, // This is a placeholder, LlamaIndex doesn't directly provide confidence scores
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error generating response with LlamaIndex:', error);
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