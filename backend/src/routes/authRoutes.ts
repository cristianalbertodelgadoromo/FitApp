import { Router } from 'express';
import { register, login, getMe, registerAdmin } from '../controllers/authController';
import { requireAuth } from '../middlewares/authMiddleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/register-admin', registerAdmin);
router.get('/me', requireAuth, getMe);

export default router;
