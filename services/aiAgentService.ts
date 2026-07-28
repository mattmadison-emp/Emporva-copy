/// <reference lib="dom" />

const AI_AGENT_BASE = import.meta.env.DEV ? '/ai-agent' : (import.meta.env.VITE_AI_AGENT_URL || '');
const AI_AGENT_API_KEY = import.meta.env.VITE_AI_AGENT_API_KEY || '';

export interface SessionResponse {
  session_id: string;
}

export interface MessageResponse {
  content: string;
  phase: string;
  message_count: number;
}

/** Convert a File to a raw base64 string (no data-URI prefix). */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip the "data:<mime>;base64," prefix
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

class AIAgentService {
  private headers(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'X-API-Key': AI_AGENT_API_KEY,
    };
  }

  /** Create a new AI agent session. */
  async createSession(): Promise<SessionResponse> {
    if (!AI_AGENT_BASE) {
      throw new Error('AI Agent URL is not configured. Set VITE_AI_AGENT_URL in your environment.');
    }

    const url = `${AI_AGENT_BASE}/api/v1/sessions`;
    console.log('[AIAgent] Creating session:', url);

    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: this.headers(),
      });
    } catch (err) {
      console.error('[AIAgent] Network error creating session:', err);
      throw new Error(`Network error: Unable to connect to AI agent at ${AI_AGENT_BASE}`);
    }

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      console.error('[AIAgent] Create session failed:', response.status, body);
      throw new Error(`Failed to create session: ${response.status} ${response.statusText}${body ? ` - ${body}` : ''}`);
    }

    return response.json();
  }

  /** Send a message (with optional image) within an existing session. */
  async sendMessage(sessionId: string, message: string, image?: File): Promise<MessageResponse> {
    const body: Record<string, string> = { message };

    if (image) {
      body.image_base64 = await fileToBase64(image);
      body.image_mime_type = image.type || 'image/jpeg';
    }

    const url = `${AI_AGENT_BASE}/api/v1/sessions/${sessionId}/messages?stream=false`;
    console.log('[AIAgent] Sending message to session:', sessionId);

    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: this.headers(),
        body: JSON.stringify(body),
      });
    } catch (err) {
      console.error('[AIAgent] Network error sending message:', err);
      throw new Error(`Network error: Unable to connect to AI agent at ${AI_AGENT_BASE}`);
    }

    if (!response.ok) {
      const respBody = await response.text().catch(() => '');
      console.error('[AIAgent] Send message failed:', response.status, respBody);
      throw new Error(`Failed to send message: ${response.status} ${response.statusText}${respBody ? ` - ${respBody}` : ''}`);
    }

    return response.json();
  }

  /** Generate a structured DIY project plan (no session needed). */
  async generateDIYPlan(projectName: string, category: string, description?: string): Promise<DIYPlanResponse> {
    if (!AI_AGENT_BASE) {
      throw new Error('AI Agent URL is not configured. Set VITE_AI_AGENT_URL in your environment.');
    }

    const url = `${AI_AGENT_BASE}/api/v1/diy-plan`;
    console.log('[AIAgent] Generating DIY plan:', projectName);

    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: this.headers(),
        body: JSON.stringify({
          projectName,
          category,
          ...(description ? { description } : {}),
        }),
      });
    } catch (err) {
      console.error('[AIAgent] Network error generating DIY plan:', err);
      throw new Error(`Network error: Unable to connect to AI agent at ${AI_AGENT_BASE}`);
    }

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      console.error('[AIAgent] DIY plan generation failed:', response.status, body);
      throw new Error(`Failed to generate plan: ${response.status} ${response.statusText}${body ? ` - ${body}` : ''}`);
    }

    return response.json();
  }
  /** Generate property improvement projections (no session needed). */
  async generateProjections(propertyData: {
    propertyType: string;
    yearBuilt: number | null;
    squareFootage: number | null;
    currentValue: number;
    systems?: Array<{ name: string; category: string; condition: string; age: number }>;
  }): Promise<ProjectionResponse> {
    if (!AI_AGENT_BASE) {
      throw new Error('AI Agent URL is not configured. Set VITE_AI_AGENT_URL in your environment.');
    }

    const url = `${AI_AGENT_BASE}/api/v1/property-projections`;
    console.log('[AIAgent] Generating property projections');

    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: this.headers(),
        body: JSON.stringify(propertyData),
      });
    } catch (err) {
      console.error('[AIAgent] Network error generating projections:', err);
      throw new Error(`Network error: Unable to connect to AI agent at ${AI_AGENT_BASE}`);
    }

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      console.error('[AIAgent] Projections generation failed:', response.status, body);
      throw new Error(`Failed to generate projections: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Generate a quote using the AI agent.
   * Creates a session, sends a structured prompt, and parses the JSON response.
   */
  async generateQuote(data: {
    jobTitle: string;
    trade: string;
    description?: string;
    budgetRange?: string;
  }): Promise<QuoteAIResponse> {
    const { session_id } = await this.createSession();

    const prompt = `You are a professional contractor quoting a job. Generate a detailed, realistic quote for the following job.

Job Title: ${data.jobTitle}
Trade: ${data.trade}
${data.description ? `Description: ${data.description}` : ''}
${data.budgetRange ? `Client Budget Range: ${data.budgetRange}` : ''}

Respond with ONLY a valid JSON object (no markdown, no code fences, no explanation) in this exact format:
{
  "scopeSummary": "A 2-3 sentence professional scope of work summary",
  "workSteps": ["Step 1", "Step 2", "Step 3", "..."],
  "lineItems": [
    {"id": "1", "description": "Labor description", "quantity": 8, "unit": "hours", "unitCost": 85, "total": 680},
    {"id": "2", "description": "Materials", "quantity": 1, "unit": "lot", "unitCost": 350, "total": 350}
  ],
  "materials": ["Material 1", "Material 2"],
  "assumptions": "Key assumptions about the job conditions",
  "exclusions": "What is NOT included in this quote",
  "estimatedDuration": "e.g. 2-3 days"
}

Make the quote realistic with accurate labor rates for the trade, realistic material costs, and appropriate scope for the described work. Line item totals must equal quantity * unitCost. Include 4-7 line items.`;

    const response = await this.sendMessage(session_id, prompt);

    // Parse the JSON from the AI response
    try {
      // Try to extract JSON from the response (handle potential markdown wrapping)
      let jsonStr = response.content.trim();
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) jsonStr = jsonMatch[0];

      const parsed = JSON.parse(jsonStr);

      // Validate and ensure required fields exist
      return {
        scopeSummary: parsed.scopeSummary || `Professional ${data.trade.toLowerCase()} work for ${data.jobTitle}.`,
        workSteps: Array.isArray(parsed.workSteps) ? parsed.workSteps : ['Site assessment', 'Execute work', 'Cleanup and walkthrough'],
        lineItems: Array.isArray(parsed.lineItems) ? parsed.lineItems.map((item: Record<string, unknown>, idx: number) => ({
          id: String(item.id || idx + 1),
          description: String(item.description || ''),
          quantity: Number(item.quantity) || 1,
          unit: String(item.unit || 'ea'),
          unitCost: Number(item.unitCost) || 0,
          total: Number(item.total) || (Number(item.quantity) || 1) * (Number(item.unitCost) || 0),
        })) : [],
        materials: Array.isArray(parsed.materials) ? parsed.materials : [],
        assumptions: parsed.assumptions || 'Standard conditions assumed.',
        exclusions: parsed.exclusions || 'Items not listed in scope are excluded.',
        estimatedDuration: parsed.estimatedDuration || '2-3 days',
      };
    } catch {
      console.error('[AIAgent] Failed to parse quote JSON, raw response:', response.content);
      throw new Error('AI generated an invalid response. Please try again.');
    }
  }
}

export interface QuoteAIResponse {
  scopeSummary: string;
  workSteps: string[];
  lineItems: Array<{ id: string; description: string; quantity: number; unit: string; unitCost: number; total: number }>;
  materials: string[];
  assumptions: string;
  exclusions: string;
  estimatedDuration: string;
}

export interface ProjectionResponse {
  projections: Array<{
    name: string;
    estimatedCost: number;
    estimatedValueAdd: number;
    projectedROI: number;
    timeframe: string;
    impact: 'High' | 'Medium' | 'Low';
    description: string;
  }>;
}

export interface DIYPlanResponse {
  complexity: 'Easy' | 'Moderate' | 'Advanced';
  estimatedTime: string;
  safetyWarnings: string[];
  tasks: Array<{ description: string; estimatedMinutes: number }>;
  materials: Array<{ name: string; quantity: number; estimatedCost: number }>;
  resources: Array<{ title: string; description: string; url: string; type: 'guide' | 'article' }>;
  proTips: string[];
  totalCost: number;
}

export const aiAgentService = new AIAgentService();
