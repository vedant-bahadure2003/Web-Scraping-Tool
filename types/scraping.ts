export interface CompanyData {
  id: string;
  companyName: string;
  websiteUrl: string;
  email?: string;
  phone?: string;
  description?: string;
  industry?: string;
  location?: string;
  foundedYear?: string;
  socialMedia?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
  techStack?: string[];
  employeeSize?: string;
  extractedAt: string;
  sourceUrl: string;
  confidence: number;
}

export interface ScrapingProgress {
  totalUrls: number;
  processedUrls: number;
  successfulExtractions: number;
  errors: number;
  currentUrl: string;
  status: 'idle' | 'running' | 'completed' | 'error' | 'paused';
}

export interface ScrapingRequest {
  type: 'query' | 'urls';
  query?: string;
  urls?: string[];
  options?: {
    maxResults?: number;
    extractionLevel?: 1 | 2 | 3;
    timeout?: number;
  };
}

export interface ScrapingResponse {
  success: boolean;
  data?: CompanyData[];
  error?: string;
  progress?: ScrapingProgress;
}