import { Router } from 'express';
import { validationMiddleware } from '../middlewares/validation.middleware.js';
import { loginSchema } from '../validationSchemas/auth.schema.js';
import { loginController, logoutController } from '../controller/auth.controller.js';

const authRouter = Router();

authRouter.post('/login', validationMiddleware(loginSchema), loginController);
authRouter.post('/logout', logoutController);
export default authRouter;
