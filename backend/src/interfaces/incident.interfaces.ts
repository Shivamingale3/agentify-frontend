import type { Incident } from '@prisma/client';
import type { IncidentSeverityType } from '../types/incident.types.js';

export interface GetIncidentsByFilterResponse {
  data: Incident[];
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
}

export interface IncidentSeverityRecommendation {
  severity: IncidentSeverityType;
  reason: string;
}

export interface IncidentAiInsights {
  summary: string;
  possibleCauses: string[];
  recommendedActions: string[];
  confidence?: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface SuggestSeverityBody {
  title: string;
  description: string | null;
  service: string | null;
}
