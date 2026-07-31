import type { NextFunction, Request, Response } from 'express';
import { ApiResponse } from '../lib/apiResponse.js';
import { aiService } from '../services/ai.service.js';
import type { SuggestSeverityBody } from '../interfaces/incident.interfaces.js';
import { getIncidentById } from '../services/incident.service.js';
import type { IncidentSeverityType, IncidentStatusType } from '../types/incident.types.js';

/**
 * Creates an AbortController bound to the request's 'close' event, so when
 * the upstream client disconnects (nginx timeout, user navigation, etc.) the
 * in-flight AI call is cancelled — preventing orphaned requests that would
 * otherwise consume the provider's rate-limit bucket and trigger 429s on
 * the user's next attempt.
 */
function createRequestAbortController(req: Request): AbortController {
  const controller = new AbortController();
  req.on('close', () => {
    if (!controller.signal.aborted) {
      controller.abort();
    }
  });
  return controller;
}

export async function suggestSeverityController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const controller = createRequestAbortController(req);
  try {
    const data = req.body as SuggestSeverityBody;
    const response = await aiService.suggestSeverity(data, controller.signal);

    res.json(ApiResponse.success('Severity suggested successfully!', response));
  } catch (error) {
    next(error);
  }
}

export async function getIncidentAiInsightsController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const controller = createRequestAbortController(req);
  try {
    const { incidentId } = req.params as { incidentId: string };
    const response = await aiService.getIncidentAiInsights(incidentId, controller.signal);

    res.json(ApiResponse.success('AI insights fetched successfully!', response));
  } catch (error) {
    next(error);
  }
}

export async function regenerateIncidentAiInsightsController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const controller = createRequestAbortController(req);
  try {
    const { incidentId } = req.params as { incidentId: string };
    const incident = await getIncidentById(incidentId);
    const response = await aiService.generateIncidentAiInsights(
      incident.id,
      incident.title,
      incident.description,
      incident.service,
      incident.severity as IncidentSeverityType,
      incident.status as IncidentStatusType,
      controller.signal,
    );

    res.json(ApiResponse.success('AI insights regenerated successfully!', response));
  } catch (error) {
    next(error);
  }
}
