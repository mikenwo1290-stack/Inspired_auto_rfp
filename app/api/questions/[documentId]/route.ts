import { NextRequest, NextResponse } from 'next/server';
import { RfpDocument } from '@/types/api';
import { questionsCache } from '../cache';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const documentId = (await params).documentId;
    
    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }
    
    // Check if we have cached data for this document
    if (questionsCache.has(documentId)) {
      return NextResponse.json(questionsCache.get(documentId));
    }
    
    // If no data exists yet, create mock data for demo purposes
    // In a real app, you would return a 404 or fetch from a database
    const mockDocument: RfpDocument = {
      documentId,
      documentName: 'Underlay Service Capabilities v1',
      extractedAt: new Date().toISOString(),
      sections: [
        {
          id: 'section_1_1',
          title: '1.1 Underlay service coverage and contracting',
          questions: [
            {
              id: 'q_1_1_1',
              question: 'Internet services as described in Appendix 1.1 (Solution Specifications Requirements) will play the most dominant role for Company ABC in the underlay networks area. In which regions or countries can you provide your services focused on locations in price list, also describe your performance in China, Japan, Argentina, Peru, Mexico, Colombia and Italy.'
            },
            {
              id: 'q_1_1_2',
              question: 'What products can you deliver in those countries (e.g. premium DIA, standard DIA, broadband, cellular/LEO)?'
            },
            {
              id: 'q_1_1_3',
              question: 'Do you have the ability to cover every Company ABC location, listed in the price list, with underlay services?'
            },
            {
              id: 'q_1_1_4',
              question: 'Please describe the operating model for delivery including any services delivered from partners.'
            },
            {
              id: 'q_1_1_5',
              question: 'Who will own the contracts with the carriers and cover all processes?'
            },
            {
              id: 'q_1_1_6',
              question: 'Are you the single point of contact? Also, if it comes to contracting?'
            }
          ]
        },
        {
          id: 'section_1_2',
          title: '1.2 Quality of internet services',
          questions: [
            {
              id: 'q_1_2_1',
              question: 'As described in Appendix 1.1 (Solution Specifications Requirements), internet connections must provide improved transmission quality. Please describe the quality parameters (throughput, jitter, latency, packet loss, etc.) which you provide for internet access links (e.g. premium DIA, standard DIA, broadband, cellular/LEO).'
            },
            {
              id: 'q_1_2_2',
              question: 'Can you deliver the requested parameters?'
            },
            {
              id: 'q_1_2_3',
              question: 'Can you deliver the requested IP addresses?'
            }
          ]
        },
        {
          id: 'section_1_3',
          title: '1.3 SLA',
          questions: [
            {
              id: 'q_1_3_1',
              question: 'SLA described in Appendix 3.2 (Service Level Matrix). Can you meet the requested SLA?'
            }
          ]
        }
      ]
    };
    
    // Store in cache
    questionsCache.set(documentId, mockDocument);
    
    return NextResponse.json(mockDocument);
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
} 