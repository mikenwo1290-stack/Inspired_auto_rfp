import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { RfpDocument } from '@/types/api';
import { DEFAULT_LANGUAGE_MODEL } from '@/lib/constants';
import { projectService } from '@/lib/project-service';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    console.log('Starting question extraction process');
    
    const { documentId, documentName, content, projectId } = await request.json();
    
    console.log(`Request received for documentId: ${documentId}, projectId: ${projectId}`);

    if (!documentId || !documentName || !content || !projectId) {
      console.error('Missing required fields:', { 
        hasDocumentId: !!documentId, 
        hasDocumentName: !!documentName, 
        hasContent: !!content, 
        hasProjectId: !!projectId 
      });
      
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Define the instructions for OpenAI
    const systemPrompt = `
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
`;

    console.log('Extracting questions from document:', documentId);
    console.log(`Content length: ${content.length} characters`);
    
    try {
      // STAGE 1: Document parsing is already complete by this point
      console.log('STAGE 1 COMPLETE: Document has been parsed by LlamaParse.');
      
      // STAGE 2: OpenAI processing
      console.log('STAGE 2 STARTING: Calling OpenAI API to extract questions...');
      const response = await openai.chat.completions.create({
        model: DEFAULT_LANGUAGE_MODEL,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: content }
        ],
        temperature: 0.1, // Low temperature for consistent, predictable results
      });

      // Parse the JSON response
      const assistantMessage = response.choices[0].message.content;
      if (!assistantMessage) {
        throw new Error('Empty response from OpenAI');
      }

      console.log('STAGE 2 COMPLETE: OpenAI response received. Parsing JSON...');
      const extractedData = JSON.parse(assistantMessage);
      
      const sectionCount = extractedData.sections?.length || 0;
      let questionCount = 0;
      
      if (extractedData.sections) {
        for (const section of extractedData.sections) {
          questionCount += section.questions?.length || 0;
        }
      }
      
      console.log(`Extracted ${sectionCount} sections and ${questionCount} questions total`);
      
      // Create the RFP document structure
      const rfpDocument: RfpDocument = {
        documentId: projectId, // Use project ID as the document ID
        documentName,
        sections: extractedData.sections || [],
        extractedAt: new Date().toISOString(),
      };

      // Store questions in the database using the project service
      console.log('FINAL STAGE: Saving questions to database...');
      try {
        await projectService.saveQuestions(projectId, rfpDocument.sections);
        console.log('Questions saved successfully to database');
      } catch (error: any) {
        console.error('Error saving questions to database:', error);
        throw new Error(`Database error: ${error?.message || 'Unknown database error'}`);
      }
      
      console.log('COMPLETE: All stages finished successfully for project:', projectId);
      
      // Return the extracted data
      return NextResponse.json(rfpDocument);
    } catch (error: any) {
      console.error('Error in OpenAI processing:', error);
      throw new Error(`OpenAI processing error: ${error?.message || 'Unknown OpenAI error'}`);
    }
    
  } catch (error: any) {
    console.error('Error extracting questions:', error);
    return NextResponse.json(
      { error: `Failed to extract questions: ${error?.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
} 