import { Router } from 'express';
import { getMyCoach } from '../controllers/coachController';
import { requireAuth } from '../middlewares/authMiddleware';

const router = Router();

router.use(requireAuth);

router.get('/my-coach', getMyCoach);

export default router;
