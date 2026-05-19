import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { validate } from '../middlewares/validate';
import { authenticate } from '../middlewares/auth';
import { registerSchema, loginSchema } from '../types/user.schemas';

const router = Router();

// Auth routes (public)
router.post('/register', validate(registerSchema), userController.register);
router.post('/login', validate(loginSchema), userController.login);

// Protected routes
router.get('/me', authenticate, userController.getMe);
router.get('/', authenticate, userController.getUsers);
router.get('/:id', authenticate, userController.getUser);

export default router;
