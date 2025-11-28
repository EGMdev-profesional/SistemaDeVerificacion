import express from 'express';
import { login, verifyAuth } from '../controllers/authController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', login);
router.get('/verify', verifyToken, verifyAuth);

export default router;
