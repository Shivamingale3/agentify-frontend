import { Router } from 'express';
import { createRateLimiter } from '../middlewares/rateLimiting.middleware.js';
import { validationMiddleware } from '../middlewares/validation.middleware.js';
import { addIncidentValidationSchema } from '../validationSchemas/addIncident.schema.js';
import {
  addNewIncidentController,
  getAllIncidentsByFilterController,
  getIncidentByIdController,
  getKpisController,
  updateIncidentSeverityController,
  updateIncidentStatusController,
} from '../controller/incident.controller.js';
import { getIncidentsByFilterValidationSchema } from '../validationSchemas/getIncidentFilters.schema.js';
import updateIncidentStatusValidationSchema from '../validationSchemas/updateIncidentStatus.schema.js';
import updateIncidentSeverityValidationSchema from '../validationSchemas/updateIncidentSeverity.schema.js';
import getIncidentByIdValidationSchema from '../validationSchemas/getIncidentById.schema.js';

const incidentRouter = Router();

const createIncidentLimiter = createRateLimiter('CREATE_INCIDENT');
const updateIncidentLimiter = createRateLimiter('UPDATE_INCIDENT');

incidentRouter.post(
  '/',
  createIncidentLimiter,
  validationMiddleware(addIncidentValidationSchema),
  addNewIncidentController,
);

incidentRouter.get(
  '/filter',
  validationMiddleware(getIncidentsByFilterValidationSchema, 'query'),
  getAllIncidentsByFilterController,
);

incidentRouter.get('/kpis', getKpisController);

incidentRouter.get(
  '/:id',
  validationMiddleware(getIncidentByIdValidationSchema, 'params'),
  getIncidentByIdController,
);

incidentRouter.patch(
  '/:incidentId/status/:status',
  updateIncidentLimiter,
  validationMiddleware(updateIncidentStatusValidationSchema, 'params'),
  updateIncidentStatusController,
);

incidentRouter.patch(
  '/:incidentId/severity/:severity',
  updateIncidentLimiter,
  validationMiddleware(updateIncidentSeverityValidationSchema, 'params'),
  updateIncidentSeverityController,
);

export default incidentRouter;
