import { Router } from 'express';
import { getCoaches, getCoachById, updateCoach } from '../controllers/coaches.controller';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.get('/',      requireRole('admin'), getCoaches);
router.get('/:id',   requireRole('admin', 'coach'), getCoachById);
router.put('/:id',   requireRole('admin', 'coach'), updateCoach);

export default router;
