import { Router } from 'express';
import healthRouter from './health.routes.js';
import incidentRouter from './incident.routes.js';
import aiRouter from './ai.routes.js';

export const router = Router();

router.use('/health', healthRouter);
router.use('/incident', incidentRouter);
router.use('/ai', aiRouter);
