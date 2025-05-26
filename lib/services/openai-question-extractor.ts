import OpenAI from 'openai';
import { IAIQuestionExtractor, AIServiceConfig } from '@/lib/interfaces/ai-service';
import { ExtractedQuestions, ExtractedQuestionsSchema } from '@/lib/validators/extract-questions';
import { DEFAULT_LANGUAGE_MODEL } from '@/lib/constants';
import { AIServiceError } from '@/lib/errors/api-errors';

/**
 * OpenAI-powered question extraction service
 */
export class OpenAIQuestionExtractor implements IAIQuestionExtractor {
  private client: OpenAI;
  private config: AIServiceConfig;

  constructor(config: Partial<AIServiceConfig> = {}) {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    this.config = {
      model: DEFAULT_LANGUAGE_MODEL,
      temperature: 0.1,
      maxTokens: 4000,
      timeout: 60000,
      ...config,
    };

    if (!process.env.OPENAI_API_KEY) {
      throw new AIServiceError('OpenAI API key is not configured');
    }
  }

  /**
   * Extract structured questions from document content
   */
  async extractQuestions(content: string, documentName: string): Promise<ExtractedQuestions> {
    try {
      const systemPrompt = this.getSystemPrompt();
      
      const response = await this.client.chat.completions.create({
        model: this.config.model,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: this.formatUserPrompt(content, documentName) }
        ],
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
      });

      const assistantMessage = response.choices[0]?.message?.content;
      if (!assistantMessage) {
        throw new AIServiceError('Empty response from OpenAI');
      }

      // Parse and validate the JSON response
      const rawData = JSON.parse(assistantMessage);
      const extractedData = ExtractedQuestionsSchema.parse(rawData);

      return extractedData;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new AIServiceError('Invalid JSON response from AI service');
      }
      if (error instanceof AIServiceError) {
        throw error;
      }
      throw new AIServiceError(`Question extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get the system prompt for question extraction
   */
  private getSystemPrompt(): string {
    return `
You are an expert at analyzing RFP (Request for Proposal) documents and extracting structured information.
Given a document that contains RFP questions, extract all sections and questions into a structured format.

Carefully identify:
1. Different sections (usually numbered like 1.1, 1.2, etc.)
2. The questions within each section
3. Any descriptive text that provides context for the section

Format the output as a JSON object with the following structure:
{
  "sections": [
    {
      "id": "unique_id",
      "title": "Section Title",
      "description": "Optional description text for the section",
      "questions": [
        {
          "id": "question_id",
          "question": "The exact text of the question"
        }
      ]
    }
  ]
}

Requirements:
- Generate unique IDs for each section and question
- Preserve the exact text of questions
- Include all questions found in the document
- Group questions correctly under their sections
- If a section has subsections, create separate sections for each subsection
    `.trim();
  }

  /**
   * Format the user prompt with context
   */
  private formatUserPrompt(content: string, documentName: string): string {
    return `Document Name: ${documentName}\n\nDocument Content:\n${content}`;
  }
}

// Export singleton instance
export const openAIQuestionExtractor = new OpenAIQuestionExtractor(); 