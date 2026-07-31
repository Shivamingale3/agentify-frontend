import { getAIProvider } from '../config/ai.config.js';
import { getIncidentAiInsightsPrompt, suggestSeverityPrompt } from '../lib/aiPrompts.js';
import { parseAIResponse } from '../utils/ai.utils.js';
import type { IncidentSeverityType, IncidentStatusType } from '../types/incident.types.js';
import type { IncidentAiInsights } from '../interfaces/incident.interfaces.js';
import {
  getCachedIncidentAiInsights,
  getIncidentById,
  updateIncidentAiInsights,
} from './incident.service.js';

/**
 * Application-level AI orchestration.
 *
 * This service is provider-agnostic: every method builds a prompt, hands it
 * to the active `AIProvider` (Gemini or Groq, selected via `AI_PROVIDER`
 * env), and parses the JSON-shaped response. Provider-specific error
 * mapping (429 / 502 / 499 / abort) lives inside each adapter — see
 * `src/config/providers/`.
 *
 * Public method signatures are stable across providers so `ai.controller.ts`
 * and the route layer never need to know which provider is active.
 */
export class AIService {
  private provider = getAIProvider();

  /**
   * Generate text from a single prompt. The optional `signal` lets callers
   * cancel the in-flight request when the upstream client disconnects —
   * preventing orphaned AI calls that would otherwise keep consuming the
   * provider's rate-limit budget and produce surprise 429s on the user's
   * next attempt.
   */
  async generate(prompt: string, signal?: AbortSignal): Promise<string> {
    return this.provider.generate(prompt, signal);
  }

  async suggestSeverity(
    input: {
      title: string;
      description?: string | null;
      service?: string | null;
    },
    signal?: AbortSignal,
  ): Promise<{
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'UNKNOWN';
    reason: string;
  }> {
    const response = await this.generate(suggestSeverityPrompt(input), signal);

    return parseAIResponse<{
      severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'UNKNOWN';
      reason: string;
    }>(response);
  }

  async getIncidentAiInsights(
    incidentId: string,
    signal?: AbortSignal,
  ): Promise<IncidentAiInsights> {
    let insights = await getCachedIncidentAiInsights(incidentId);
    if (insights !== null) {
      return insights;
    }
    const incident = await getIncidentById(incidentId);
    insights = await this.generateIncidentAiInsights(
      incident.id,
      incident.title,
      incident.description,
      incident.service,
      incident.severity as IncidentSeverityType,
      incident.status as IncidentStatusType,
      signal,
    );
    return insights;
  }

  async generateIncidentAiInsights(
    incidentId: string,
    title: string,
    description: string | null,
    service: string | null,
    severity: IncidentSeverityType,
    status: IncidentStatusType,
    signal?: AbortSignal,
  ): Promise<IncidentAiInsights> {
    const response = await this.generate(
      getIncidentAiInsightsPrompt(title, description, service, severity, status),
      signal,
    );

    const insights = parseAIResponse<IncidentAiInsights>(response);
    await updateIncidentAiInsights(incidentId, insights);
    return insights;
  }
}

export const aiService = new AIService();
