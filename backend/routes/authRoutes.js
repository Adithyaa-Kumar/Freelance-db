import express from 'express';
import { authController } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', authController.signup);
router.post('/login', authController.login);
router.get('/me', authMiddleware, authController.getProfile);
router.put('/profile', authMiddleware, authController.updateProfile);

export default router;
