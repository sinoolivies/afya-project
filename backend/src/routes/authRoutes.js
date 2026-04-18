import express from 'express';
import { getMe, login, registerAdmin } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { authRateLimiter } from '../middleware/rateLimit.js';
import { validate } from '../middleware/validate.js';
import { loginValidation, registerAdminValidation } from '../validators/authValidators.js';

const router = express.Router();

router.post('/register-admin', authRateLimiter, registerAdminValidation, validate, registerAdmin);
router.post('/login', authRateLimiter, loginValidation, validate, login);
router.get('/me', protect, getMe);

export default router;
