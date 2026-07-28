
/// <reference lib="dom" />

// Emporva AI Backend API Service
// Handles all communication with the Digital General Contractor backend

export interface IntakeRequest {
  homeownerId: string;
  propertyId: string;
  description: string;
  photos: string[];
  videos: string[];
  locationZip: string;
}

export interface IntakeResponse {
  issueSummary: string;
  category: string;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY';
  systemsAffected: string[];
  recommendedTrades: string[];
  workflowPlan: string[];
  safetyWarnings: string[];
  followUpQuestions?: FollowUpQuestion[];
  estimatedCostRange?: {
    min: number;
    max: number;
  };
  sessionId: string;
}

export interface FollowUpQuestion {
  id: string;
  question: string;
  type: 'text' | 'yesno' | 'number' | 'multiple-choice';
  options?: string[];
  required: boolean;
}

export interface FollowUpRequest {
  sessionId: string;
  homeownerId: string;
  answers: Record<string, string | number | boolean>;
}

export interface FollowUpResponse {
  refinedDiagnosis: string;
  updatedWorkflow: string[];
  updatedCostRange: {
    min: number;
    max: number;
  };
  measurements?: {
    squareFootage?: number;
    linearFeet?: number;
    units?: number;
  };
  materialsList: Material[];
  readyForConfirmation: boolean;
  additionalQuestions?: FollowUpQuestion[];
}

export interface Material {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  estimatedCost: number;
  sharedAcrossTrades?: boolean;
  tradeId?: string;
}

export interface JobConfirmRequest {
  sessionId: string;
  homeownerId: string;
  propertyId: string;
  selectedContractorIds?: string[];
  autoMatch?: boolean;
}

export interface ContractorMatch {
  contractorId: string;
  name: string;
  company: string;
  tradeSpecialty: string[];
  zipCoverage: string[];
  reliabilityScore: number;
  emergencyAvailable: boolean;
  estimatedResponseTime: string;
  reviewCount: number;
  rating: number;
  photo: string;
  phone: string;
  email: string;
}

export interface JobConfirmResponse {
  jobId: string;
  title: string;
  status: 'PENDING_APPROVAL' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED';
  matchedContractors: ContractorMatch[];
  multiTrade: boolean;
  trades?: TradeScope[];
  createdAt: string;
}

export interface TradeScope {
  tradeId: string;
  tradeName: string;
  contractorId?: string;
  status: 'BLOCKED' | 'READY_TO_START' | 'AWAITING_APPROVAL' | 'IN_PROGRESS' | 'COMPLETE';
  dependencies: string[];
  materials: Material[];
  cost: number;
  startDate?: string;
  endDate?: string;
  squareFootage?: number;
}

// API Base URL - Replace with actual backend URL
const API_BASE_URL = import.meta.env.VITE_EMPORVA_API_URL || 'https://api.emporva.com';

class EmporvaApiService {
  private async fetchApi<T>(endpoint: string, options: Record<string, any> = {}): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  async submitIntake(data: IntakeRequest): Promise<IntakeResponse> {
    return this.fetchApi<IntakeResponse>('/api/intake', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async submitFollowUp(data: FollowUpRequest): Promise<FollowUpResponse> {
    return this.fetchApi<FollowUpResponse>('/api/followup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async confirmJob(data: JobConfirmRequest): Promise<JobConfirmResponse> {
    return this.fetchApi<JobConfirmResponse>('/api/job/confirm', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async uploadMedia(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/api/media/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Media upload failed');
    }

    return response.json();
  }
}

export const emporvaApi = new EmporvaApiService();
