import { Router } from 'express';
import { getExercises, createExercise } from '../controllers/exercises.controller';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.get('/',  requireRole('admin', 'coach', 'client', 'nutritionist'), getExercises);
router.post('/', requireRole('admin', 'coach'), createExercise);

export default router;
