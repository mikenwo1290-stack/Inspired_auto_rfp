import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { RfpDocument } from '@/types/api';
import { DEFAULT_LANGUAGE_MODEL } from '@/lib/constants';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Reference to the questionsCache in the questions API
// In a real app, this would be a database
import { questionsCache } from '../questions/cache';

export async function POST(request: NextRequest) {
  try {
    const { documentId, documentName, content } = await request.json();

    if (!documentId || !documentName || !content) {
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
    
    // Call OpenAI API
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

    const extractedData = JSON.parse(assistantMessage);
    
    // Create the RFP document structure
    const rfpDocument: RfpDocument = {
      documentId,
      documentName,
      sections: extractedData.sections || [],
      extractedAt: new Date().toISOString(),
    };

    // Store in cache for later retrieval
    questionsCache.set(documentId, rfpDocument);
    console.log('Stored extracted questions in cache for document:', documentId);
    
    // Return the extracted data
    return NextResponse.json(rfpDocument);
    
  } catch (error) {
    console.error('Error extracting questions:', error);
    return NextResponse.json(
      { error: 'Failed to extract questions' },
      { status: 500 }
    );
  }
} 