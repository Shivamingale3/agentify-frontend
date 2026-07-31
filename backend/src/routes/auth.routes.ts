import { Router } from 'express';

const authRouter = Router();

authRouter.get('/login', (_req, res) => {
  res.json({
    success: true,
    message: 'Login',
  });
});
authRouter.get('/signup', (_req, res) => {
  res.json({
    success: true,
    message: 'Signup',
  });
});
authRouter.get('/logout', (_req, res) => {
  res.json({
    success: true,
    message: 'Logout',
  });
});
export default authRouter;
