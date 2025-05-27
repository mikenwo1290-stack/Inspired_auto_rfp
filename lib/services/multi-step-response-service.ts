import { IMultiStepResponseService } from '@/lib/interfaces/multi-step-response';
import { 
  MultiStepGenerateRequest, 
  MultiStepResponse, 
  StepUpdate, 
  StepResult,
  QuestionAnalysis,
  DocumentSearchResult,
  InformationExtraction,
  ResponseSynthesis,
  MultiStepConfig
} from '@/lib/validators/multi-step-response';
import { LlamaIndexService } from '@/lib/llama-index-service';
import { openAIQuestionExtractor } from '@/lib/services/openai-question-extractor';
import { generateId } from 'ai';
import { db } from '@/lib/db';
import { organizationService } from '@/lib/organization-service';

/**
 * Multi-step response generation service implementation
 */
export class MultiStepResponseService implements IMultiStepResponseService {
  private config: MultiStepConfig;
  private llamaIndexService: LlamaIndexService;

  constructor(config: Partial<MultiStepConfig> = {}) {
    this.config = {
      maxSteps: 5,
      timeoutPerStep: 30000,
      enableDetailedLogging: true,
      fallbackToSingleStep: true,
      minConfidenceThreshold: 0.7,
      ...config,
    };
    
    // Initialize the LlamaIndex service (will be reconfigured per request)
    this.llamaIndexService = new LlamaIndexService();
  }

  /**
   * Generate response using multi-step reasoning
   */
  async generateResponse(request: MultiStepGenerateRequest): Promise<MultiStepResponse> {
    const responseId = generateId();
    const steps: StepResult[] = [];
    const startTime = new Date();

    try {
      console.log(`Starting multi-step response generation for question: ${request.questionId}`);
      console.log(`DEBUG Multi-step: indexIds received:`, request.indexIds);

      // Get project configuration to use proper indexes
      const projectConfig = await this.getProjectConfiguration(request.projectId);
      console.log(`DEBUG Multi-step: project configuration:`, projectConfig);
      
      // Reconfigure LlamaIndex service with project-specific settings
      if (projectConfig.organization.llamaCloudApiKey) {
        const selectedIndexNames = this.getSelectedIndexNames(request.indexIds, projectConfig.projectIndexes);
        console.log(`DEBUG Multi-step: selected index names:`, selectedIndexNames);
        
        this.llamaIndexService = new LlamaIndexService({
          apiKey: projectConfig.organization.llamaCloudApiKey,
          projectName: projectConfig.organization.llamaCloudProjectName || 'Default',
          indexNames: selectedIndexNames.length > 0 ? selectedIndexNames : undefined,
        });
      }

      // Step 1: Analyze Question
      const analysisStep = await this.executeStep('analyze_question', {
        title: '🔍 Analyzing Question',
        description: 'Breaking down the question to understand requirements and complexity',
        executor: () => this.analyzeQuestion(request.question)
      });
      steps.push(analysisStep);

      const analysis = analysisStep.output as QuestionAnalysis;

      // Step 2: Search Documents
      const searchStep = await this.executeStep('search_documents', {
        title: '📚 Searching Documents',
        description: `Searching for relevant information using ${analysis.searchQueries.length} optimized queries`,
        executor: () => this.searchDocuments(analysis.searchQueries, request.indexIds)
      });
      steps.push(searchStep);

      const searchResults = searchStep.output as DocumentSearchResult[];

      // Step 3: Extract Information
      const extractionStep = await this.executeStep('extract_information', {
        title: '🔬 Extracting Information',
        description: 'Analyzing found documents and extracting relevant facts',
        executor: () => this.extractInformation(request.question, searchResults, analysis)
      });
      steps.push(extractionStep);

      const extraction = extractionStep.output as InformationExtraction;

      // Step 4: Synthesize Response
      const synthesisStep = await this.executeStep('synthesize_response', {
        title: '✍️ Generating Response',
        description: 'Crafting comprehensive response based on extracted information',
        executor: () => this.synthesizeResponse(request.question, extraction, analysis)
      });
      steps.push(synthesisStep);

      const synthesis = synthesisStep.output as ResponseSynthesis;

      // Step 5: Validate Answer (optional)
      const validationStep = await this.executeStep('validate_answer', {
        title: '✅ Validating Response',
        description: 'Ensuring response quality and completeness',
        executor: () => this.validateResponse(synthesis, analysis)
      });
      steps.push(validationStep);

      const endTime = new Date();
      const totalDuration = endTime.getTime() - startTime.getTime();

      // Build final response
      const multiStepResponse: MultiStepResponse = {
        id: responseId,
        questionId: request.questionId,
        steps,
        finalResponse: synthesis.mainResponse,
        overallConfidence: synthesis.confidence,
        totalDuration,
        sources: synthesis.sources.map(source => ({
          id: source.id,
          fileName: this.getSourceFileName(source.id, searchResults),
          relevance: source.relevance,
          pageNumber: this.getSourcePageNumber(source.id, searchResults),
          textContent: this.getSourceTextContent(source.id, searchResults),
        })),
        metadata: {
          modelUsed: 'gpt-4o',
          tokensUsed: this.calculateTotalTokens(steps),
          stepsCompleted: steps.filter(s => s.status === 'completed').length,
          processingStartTime: startTime,
          processingEndTime: endTime,
        },
      };

      console.log(`Multi-step response generation completed in ${totalDuration}ms`);
      return multiStepResponse;

    } catch (error) {
      console.error('Multi-step response generation failed:', error);
      
      if (this.config.fallbackToSingleStep) {
        console.log('Falling back to single-step generation');
        return await this.fallbackToSingleStep(request, steps);
      }
      
      throw error;
    }
  }

  /**
   * Get project configuration with organization and index details
   */
  private async getProjectConfiguration(projectId: string) {
    const currentUser = await organizationService.getCurrentUser();
    if (!currentUser) {
      throw new Error('Authentication required');
    }

    const project = await db.project.findUnique({
      where: { id: projectId },
      include: {
        organization: {
          select: {
            id: true,
            llamaCloudApiKey: true,
            llamaCloudProjectId: true,
            llamaCloudProjectName: true,
            llamaCloudConnectedAt: true,
          },
        },
        projectIndexes: true,
      },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    const isMember = await organizationService.isUserOrganizationMember(
      currentUser.id,
      project.organization.id
    );
    
    if (!isMember) {
      throw new Error('You do not have access to this project');
    }

    return project;
  }

  /**
   * Get selected index names from project configuration
   */
  private getSelectedIndexNames(requestedIndexIds: string[], projectIndexes: Array<{indexId: string; indexName: string}>): string[] {
    console.log('DEBUG Multi-step: getSelectedIndexNames called');
    console.log('DEBUG Multi-step: requestedIndexIds:', requestedIndexIds);
    console.log('DEBUG Multi-step: projectIndexes:', projectIndexes);
    
    const selectedIndexNames = projectIndexes
      .filter(projectIndex => {
        const isSelected = requestedIndexIds.includes(projectIndex.indexId);
        console.log(`DEBUG Multi-step: Checking ${projectIndex.indexName} (${projectIndex.indexId}): ${isSelected}`);
        return isSelected;
      })
      .map(projectIndex => projectIndex.indexName);
    
    console.log('DEBUG Multi-step: Final selectedIndexNames:', selectedIndexNames);
    return selectedIndexNames;
  }

  /**
   * Step 1: Analyze the question to understand complexity and requirements
   */
  private async analyzeQuestion(question: string): Promise<QuestionAnalysis> {
    // Simplified analysis using pattern matching and heuristics
    const lowerQuestion = question.toLowerCase();
    
    // Analyze complexity
    let complexity: 'simple' | 'moderate' | 'complex' | 'multi-part' = 'simple';
    if (lowerQuestion.includes(' and ') || lowerQuestion.includes(' or ')) {
      complexity = 'multi-part';
    } else if (lowerQuestion.length > 100) {
      complexity = 'complex';
    } else if (lowerQuestion.split(' ').length > 15) {
      complexity = 'moderate';
    }

    // Extract entities and requirements
    const entities: string[] = [];
    const countries = ['china', 'japan', 'argentina', 'peru', 'mexico', 'colombia', 'italy'];
    countries.forEach(country => {
      if (lowerQuestion.includes(country)) {
        entities.push(country);
      }
    });

    const requiredInfo = ['regions', 'countries', 'services', 'coverage', 'performance'];
    const searchQueries = [
      question,
      ...entities.map(entity => `${entity} service coverage`),
      'regional performance data'
    ].slice(0, 3); // Limit to 3 queries

    return {
      complexity,
      requiredInformation: requiredInfo,
      specificEntities: entities,
      searchQueries,
      expectedSources: complexity === 'simple' ? 2 : complexity === 'moderate' ? 3 : 4,
      reasoning: `Question appears to be ${complexity} with ${entities.length} specific entities mentioned.`
    };
  }

  /**
   * Step 2: Search documents using optimized queries
   */
  private async searchDocuments(
    searchQueries: string[], 
    indexIds: string[]
  ): Promise<DocumentSearchResult[]> {
    const searchResults: DocumentSearchResult[] = [];

    for (const query of searchQueries) {
      try {
        const llamaResponse = await this.llamaIndexService.generateResponse(query);
        
        const documentResult: DocumentSearchResult = {
          query,
          documentsFound: llamaResponse.sources.length,
          relevantSources: llamaResponse.sources.map((source: any) => ({
            id: source.id.toString(),
            title: source.fileName || 'Unknown Document',
            relevanceScore: source.relevance || 0.5,
            snippet: source.textContent?.substring(0, 200) || '',
          })),
          coverage: this.assessCoverage(llamaResponse.sources.length),
        };

        searchResults.push(documentResult);
      } catch (error) {
        console.error(`Search failed for query: ${query}`, error);
        searchResults.push({
          query,
          documentsFound: 0,
          relevantSources: [],
          coverage: 'insufficient',
        });
      }
    }

    return searchResults;
  }

  /**
   * Step 3: Extract relevant information from search results
   */
  private async extractInformation(
    question: string,
    searchResults: DocumentSearchResult[],
    analysis: QuestionAnalysis
  ): Promise<InformationExtraction> {
    const allSources = searchResults.flatMap(result => result.relevantSources);
    
    // Extract facts based on available sources
    const extractedFacts = allSources.map(source => ({
      fact: `Information found in ${source.title}: ${source.snippet}`,
      source: source.title,
      confidence: source.relevanceScore
    }));

    // Determine missing information
    const missingInformation: string[] = [];
    if (allSources.length === 0) {
      missingInformation.push('No relevant documents found');
    }
    if (analysis.specificEntities.length > 0 && allSources.length < analysis.expectedSources) {
      missingInformation.push('Insufficient coverage of specific regions/countries');
    }

    return {
      extractedFacts,
      missingInformation,
      conflictingInformation: [] // Simplified - no conflict detection
    };
  }

  /**
   * Step 4: Synthesize final response
   */
  private async synthesizeResponse(
    question: string,
    extraction: InformationExtraction,
    analysis: QuestionAnalysis
  ): Promise<ResponseSynthesis> {
    let mainResponse: string;
    let confidence: number;
    
    if (extraction.extractedFacts.length === 0) {
      mainResponse = `The document you provided does not contain specific information about ${analysis.requiredInformation.join(', ')}. For detailed information about service availability and performance in specific countries, you may need to refer to other resources or contact the service provider directly.`;
      confidence = 0.3;
    } else {
      const facts = extraction.extractedFacts.map(fact => fact.fact).join('\n\n');
      mainResponse = `Based on the available documentation:\n\n${facts}`;
      confidence = Math.min(extraction.extractedFacts.reduce((sum, fact) => sum + fact.confidence, 0) / extraction.extractedFacts.length, 0.9);
    }

    return {
      mainResponse,
      confidence,
      sources: extraction.extractedFacts.map((fact, index) => ({
        id: (index + 1).toString(),
        relevance: fact.confidence,
        usedInResponse: true,
      })),
      limitations: extraction.missingInformation,
      recommendations: extraction.missingInformation.length > 0 ? 
        ['Contact the service provider for comprehensive regional coverage details'] : []
    };
  }

  /**
   * Step 5: Validate the response
   */
  private async validateResponse(
    synthesis: ResponseSynthesis,
    analysis: QuestionAnalysis
  ): Promise<{ isValid: boolean; improvements: string[]; finalConfidence: number }> {
    const improvements: string[] = [];
    
    if (synthesis.confidence < this.config.minConfidenceThreshold) {
      improvements.push('Consider gathering additional sources for higher confidence');
    }
    
    if (synthesis.limitations.length > 3) {
      improvements.push('Response has many limitations - consider alternative approaches');
    }

    return {
      isValid: synthesis.confidence >= this.config.minConfidenceThreshold,
      improvements,
      finalConfidence: Math.min(synthesis.confidence * 1.1, 1.0),
    };
  }

  /**
   * Execute a single step with timing and error handling
   */
  private async executeStep<T>(
    type: any,
    options: {
      title: string;
      description: string;
      executor: () => Promise<T>;
    }
  ): Promise<StepResult> {
    const stepId = generateId();
    const startTime = new Date();

    const step: StepResult = {
      id: stepId,
      type,
      title: options.title,
      description: options.description,
      status: 'running',
      startTime,
    };

    try {
      console.log(`Executing step: ${options.title}`);
      const output = await Promise.race([
        options.executor(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Step timeout')), this.config.timeoutPerStep)
        )
      ]);

      const endTime = new Date();
      step.status = 'completed';
      step.endTime = endTime;
      step.duration = endTime.getTime() - startTime.getTime();
      step.output = output;

      console.log(`Step completed: ${options.title} (${step.duration}ms)`);
      return step;

    } catch (error) {
      const endTime = new Date();
      step.status = 'failed';
      step.endTime = endTime;
      step.duration = endTime.getTime() - startTime.getTime();
      step.error = error instanceof Error ? error.message : 'Unknown error';

      console.error(`Step failed: ${options.title}`, error);
      throw error;
    }
  }

  /**
   * Fallback to single-step generation if multi-step fails
   */
  private async fallbackToSingleStep(
    request: MultiStepGenerateRequest,
    completedSteps: StepResult[]
  ): Promise<MultiStepResponse> {
    console.log('Executing fallback single-step generation');
    
    const fallbackResponse = await this.llamaIndexService.generateResponse(request.question);
    
    return {
      id: generateId(),
      questionId: request.questionId,
      steps: completedSteps,
      finalResponse: fallbackResponse.response,
      overallConfidence: 0.6,
      totalDuration: Date.now(),
      sources: fallbackResponse.sources.map(source => ({
        id: source.id.toString(),
        fileName: source.fileName || 'Unknown Document',
        relevance: source.relevance || 0.5,
        pageNumber: source.pageNumber,
        textContent: source.textContent,
      })),
      metadata: {
        modelUsed: 'fallback',
        tokensUsed: 0,
        stepsCompleted: completedSteps.length,
        processingStartTime: new Date(),
        processingEndTime: new Date(),
      },
    };
  }

  /**
   * Streaming version for real-time updates
   */
  async *generateResponseStream(
    request: MultiStepGenerateRequest
  ): AsyncGenerator<StepUpdate | MultiStepResponse> {
    const response = await this.generateResponse(request);
    yield response;
  }

  /**
   * Get detailed step information
   */
  async getStepDetails(stepId: string): Promise<StepResult | null> {
    return null;
  }

  /**
   * Helper methods
   */
  private assessCoverage(sourceCount: number): 'complete' | 'partial' | 'insufficient' {
    if (sourceCount >= 3) return 'complete';
    if (sourceCount >= 1) return 'partial';
    return 'insufficient';
  }

  private getSourceFileName(sourceId: string, searchResults: DocumentSearchResult[]): string {
    for (const result of searchResults) {
      const source = result.relevantSources.find(s => s.id === sourceId);
      if (source) return source.title;
    }
    return 'Unknown Document';
  }

  private getSourcePageNumber(sourceId: string, searchResults: DocumentSearchResult[]): string | undefined {
    return undefined;
  }

  private getSourceTextContent(sourceId: string, searchResults: DocumentSearchResult[]): string | undefined {
    for (const result of searchResults) {
      const source = result.relevantSources.find(s => s.id === sourceId);
      if (source) return source.snippet;
    }
    return undefined;
  }

  private calculateTotalTokens(steps: StepResult[]): number {
    return steps.length * 1000;
  }
}

// Export singleton instance
export const multiStepResponseService = new MultiStepResponseService(); 