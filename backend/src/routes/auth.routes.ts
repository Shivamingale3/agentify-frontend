import { Router } from 'express';
import { validationMiddleware } from '../middlewares/validation.middleware.js';
import {
  loginSchema,
  registerUserSchema,
  verifyEmailSchema,
} from '../validationSchemas/auth.schema.js';
import {
  loginController,
  logoutController,
  registerController,
  verifyEmailController,
} from '../controller/auth.controller.js';

const authRouter = Router();

authRouter.post('/login', validationMiddleware(loginSchema), loginController);
authRouter.post('/register', validationMiddleware(registerUserSchema), registerController);
authRouter.post('/verify-email', validationMiddleware(verifyEmailSchema), verifyEmailController);
authRouter.post('/logout', logoutController);
export default authRouter;
