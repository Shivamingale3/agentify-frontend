import { Router } from 'express';
import authRouter from './auth.routes.js';
import healthRouter from './health.routes.js';

export const router = Router();

router.use('/auth', authRouter);
router.use('/health', healthRouter);
