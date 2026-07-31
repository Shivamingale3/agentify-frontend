import { Router } from 'express';
import { createRateLimiter } from '../middlewares/rateLimiting.middleware.js';
import { validationMiddleware } from '../middlewares/validation.middleware.js';
import suggestSeverityValidationSchema from '../validationSchemas/suggestSeverity.schema.js';
import {
  getIncidentAiInsightsController,
  regenerateIncidentAiInsightsController,
  suggestSeverityController,
} from '../controller/ai.controller.js';
import getIncidentAiInsightsSchema from '../validationSchemas/getIncidentAiInsights.schema.js';

const aiRouter = Router();

aiRouter.post(
  '/incident/suggest-severity',
  createRateLimiter('SUGGEST_SEVERITY'),
  validationMiddleware(suggestSeverityValidationSchema, 'body'),
  suggestSeverityController,
);

aiRouter.get(
  '/incident/:incidentId/insights',
  createRateLimiter('INCIDENT_AI_INSIGHTS'),
  validationMiddleware(getIncidentAiInsightsSchema, 'params'),
  getIncidentAiInsightsController,
);

aiRouter.put(
  '/incident/:incidentId/insights/regenerate',
  createRateLimiter('INCIDENT_AI_INSIGHTS'),
  validationMiddleware(getIncidentAiInsightsSchema, 'params'),
  regenerateIncidentAiInsightsController,
);

export default aiRouter;
