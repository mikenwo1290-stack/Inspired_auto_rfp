import { ILlamaParseClient } from '@/lib/interfaces/llamaparse-service';
import { LlamaParseOptions, LlamaParseResult, LlamaParseResultSchema } from '@/lib/validators/llamaparse';
import { LlamaParseService } from '@/lib/llamaparse-service';
import { ExternalServiceError, ConfigurationError } from '@/lib/errors/api-errors';

/**
 * LlamaParse client wrapper implementation
 */
export class LlamaParseClient implements ILlamaParseClient {
  private llamaParseService: LlamaParseService | null = null;
  private initializationError: Error | null = null;

  constructor() {
    this.initializeService();
  }

  /**
   * Initialize the LlamaParse service
   */
  private initializeService(): void {
    try {
      this.llamaParseService = new LlamaParseService();
      console.log('LlamaParse service initialized successfully');
    } catch (error) {
      this.initializationError = error instanceof Error ? error : new Error('Unknown initialization error');
      console.error('Failed to initialize LlamaParse service:', this.initializationError.message);
    }
  }

  /**
   * Check if LlamaParse service is properly configured
   */
  isConfigured(): boolean {
    return this.llamaParseService !== null && this.initializationError === null;
  }

  /**
   * Parse a file using LlamaParse service
   */
  async parseFile(file: File, options: LlamaParseOptions): Promise<LlamaParseResult> {
    // Check service availability
    if (!this.isConfigured()) {
      throw new ConfigurationError(
        this.initializationError 
          ? `LlamaParse service not configured: ${this.initializationError.message}`
          : 'LlamaParse service is not configured. Please check your environment variables.'
      );
    }

    try {
      console.log(`Starting LlamaParse processing for file: ${file.name}`);
      console.log('Parse options:', options);

      // Transform options to match the existing service interface
      const serviceOptions = {
        fastMode: options.fastMode,
        premiumMode: options.premiumMode,
        complexTables: options.complexTables,
      };

      // Call the existing LlamaParse service
      const result = await this.llamaParseService!.parseFile(file, serviceOptions);

      // Validate the result structure
      const validatedResult = LlamaParseResultSchema.parse(result);

      console.log(`LlamaParse processing completed for document: ${validatedResult.id}`);
      
      return validatedResult;
    } catch (error) {
      console.error('LlamaParse processing failed:', error);
      
      if (error instanceof ConfigurationError) {
        throw error;
      }
      
      throw new ExternalServiceError(
        `LlamaParse processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'LlamaParse'
      );
    }
  }

  /**
   * Get service status and configuration info
   */
  getServiceStatus(): {
    configured: boolean;
    error: string | null;
    version: string | null;
  } {
    return {
      configured: this.isConfigured(),
      error: this.initializationError?.message || null,
      version: this.llamaParseService ? 'Available' : null,
    };
  }

  /**
   * Retry initialization if it failed
   */
  retryInitialization(): boolean {
    if (this.isConfigured()) {
      return true;
    }

    this.initializeService();
    return this.isConfigured();
  }
}

// Export singleton instance
export const llamaParseClient = new LlamaParseClient(); 