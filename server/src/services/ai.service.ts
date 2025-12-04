/**
 * AI Service - Ollama Integration
 * 
 * This service handles all AI operations using Ollama running locally.
 * It forces JSON mode to ensure parseable outputs.
 */

import axios from 'axios';

interface OllamaMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OllamaChatRequest {
  model: string;
  messages: OllamaMessage[];
  stream: boolean;
  format?: 'json';
}

interface OllamaChatResponse {
  model: string;
  created_at: string;
  message: {
    role: string;
    content: string;
  };
  done: boolean;
}

export class AIService {
  private apiUrl: string;
  private model: string;

  constructor() {
    this.apiUrl = process.env.OLLAMA_API_URL || 'http://localhost:11434';
    this.model = process.env.OLLAMA_MODEL || 'llama3.2:1b';
    console.log("Model: ", this.model);
  }

  /**
   * Generic method to chat with Ollama with JSON response
   */
  private async chat(systemPrompt: string, userPrompt: string): Promise<any> {
    try {
      const payload: OllamaChatRequest = {
        model: this.model,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        stream: false,
      };

      // Only add format: 'json' for models that support it (3B+)
      // Smaller models like 1B may not support structured output
      if (!this.model.includes(':1b')) {
        payload.format = 'json';
      }

      const response = await axios.post<OllamaChatResponse>(
        `${this.apiUrl}/api/chat`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 120000, // 120 second timeout for smaller models
        }
      );

      const content = response.data.message.content;
      
      // Parse JSON response
      try {
        return JSON.parse(content);
      } catch (parseError) {
        // If JSON parsing fails, try to extract JSON from markdown code blocks
        const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || 
                          content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            return JSON.parse(jsonMatch[1] || jsonMatch[0]);
          } catch {
            console.error('Failed to parse AI response as JSON:', content);
            throw new Error('AI response is not valid JSON');
          }
        }
        console.error('Failed to parse AI response as JSON:', content);
        throw new Error('AI response is not valid JSON');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Ollama API Error:', error.message);
        if (error.response?.data) {
          console.error('Ollama Error Details:', error.response.data);
        }
        throw new Error(`Failed to communicate with Ollama: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Task A: Parse RFP from natural language
   * Converts user text like "I need 50 laptops for $50k" into structured JSON
   */
  async parseRFP(rawContent: string): Promise<{
    title: string;
    items: Array<{ name: string; quantity: number; specifications?: string }>;
    budget: number;
    currency: string;
    timeline?: string;
    requirements: string[];
    categories: string[];
  }> {
    const systemPrompt = `You are an expert RFP (Request for Proposal) parser. 
Your task is to analyze natural language text and extract structured information about procurement requests.

You MUST respond with ONLY valid JSON in this exact format:
{
  "title": "Brief descriptive title for the RFP",
  "items": [
    {
      "name": "Item name",
      "quantity": 0,
      "specifications": "Any specific requirements"
    }
  ],
  "budget": 0,
  "currency": "USD",
  "timeline": "Expected timeline or deadline",
  "requirements": ["requirement 1", "requirement 2"],
  "categories": ["category 1", "category 2"]
}

Extract all relevant information from the user's request. If information is not provided, use reasonable defaults.
For budget, extract numeric values only. For timeline, extract any time-related information.
Categories should be high-level classifications like "Hardware", "Software", "Services", etc.`;

    const userPrompt = `Parse this RFP request and extract structured information:\n\n${rawContent}`;

    return await this.chat(systemPrompt, userPrompt);
  }

  /**
   * Task B: Parse Proposal from vendor email
   * Converts vendor email into structured proposal data
   */
  async parseProposal(emailBody: string, rfpContext?: string): Promise<{
    price: number;
    currency: string;
    timeline: string;
    items: Array<{ name: string; unitPrice: number; quantity: number; total: number }>;
    terms: string[];
    deliverables: string[];
    notes?: string;
  }> {
    const systemPrompt = `You are an expert proposal analyzer. 
Your task is to extract structured information from vendor proposal emails.

You MUST respond with ONLY valid JSON in this exact format:
{
  "price": 0,
  "currency": "USD",
  "timeline": "Delivery timeline",
  "items": [
    {
      "name": "Item name",
      "unitPrice": 0,
      "quantity": 0,
      "total": 0
    }
  ],
  "terms": ["term 1", "term 2"],
  "deliverables": ["deliverable 1", "deliverable 2"],
  "notes": "Any additional notes or special conditions"
}

Extract pricing, timeline, itemized costs, payment terms, and deliverables from the proposal.
If specific information is not provided, omit it or use null.`;

    let userPrompt = `Parse this vendor proposal and extract structured information:\n\n${emailBody}`;
    
    if (rfpContext) {
      userPrompt += `\n\nOriginal RFP Context:\n${rfpContext}`;
    }

    return await this.chat(systemPrompt, userPrompt);
  }

  /**
   * Task C: Compare multiple proposals and generate ranked summary
   */
  async compareProposals(
    rfpTitle: string,
    proposals: Array<{
      vendorName: string;
      proposalData: any;
    }>
  ): Promise<{
    rankings: Array<{
      rank: number;
      vendorName: string;
      score: number;
      pros: string[];
      cons: string[];
      recommendation: string;
    }>;
    summary: string;
    bestValue: string;
    fastestDelivery: string;
  }> {
    const systemPrompt = `You are an expert procurement analyst. 
Your task is to compare multiple vendor proposals and provide a ranked analysis.

You MUST respond with ONLY valid JSON in this exact format:
{
  "rankings": [
    {
      "rank": 1,
      "vendorName": "Vendor Name",
      "score": 85,
      "pros": ["advantage 1", "advantage 2"],
      "cons": ["disadvantage 1"],
      "recommendation": "Brief recommendation"
    }
  ],
  "summary": "Overall analysis summary",
  "bestValue": "Vendor name offering best value",
  "fastestDelivery": "Vendor name with fastest delivery"
}

Rank proposals based on price, timeline, completeness, and terms.
Score each proposal from 0-100.
Provide clear pros/cons for each vendor.`;

    const userPrompt = `Compare these proposals for RFP: "${rfpTitle}"\n\nProposals:\n${JSON.stringify(
      proposals,
      null,
      2
    )}`;

    return await this.chat(systemPrompt, userPrompt);
  }

  /**
   * Score a single proposal (0-100)
   */
  async scoreProposal(
    proposalData: any,
    rfpRequirements: any
  ): Promise<{ score: number; summary: string; strengths: string[]; weaknesses: string[] }> {
    const systemPrompt = `You are an expert proposal evaluator.
Analyze a vendor proposal against RFP requirements and provide a detailed score.

You MUST respond with ONLY valid JSON in this exact format:
{
  "score": 85,
  "summary": "Brief evaluation summary",
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["weakness 1", "weakness 2"]
}

Score from 0-100 based on: price competitiveness, timeline feasibility, completeness, and terms.`;

    const userPrompt = `Evaluate this proposal:\n\nRFP Requirements:\n${JSON.stringify(
      rfpRequirements,
      null,
      2
    )}\n\nProposal:\n${JSON.stringify(proposalData, null, 2)}`;

    return await this.chat(systemPrompt, userPrompt);
  }

  /**
   * Health check for Ollama service
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.apiUrl}/api/tags`, {
        timeout: 5000,
      });
      return response.status === 200;
    } catch (error) {
      console.error('Ollama health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const aiService = new AIService();
