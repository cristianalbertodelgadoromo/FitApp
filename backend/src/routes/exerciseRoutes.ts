import { Router } from 'express';
import { getExercises, createExercise } from '../controllers/exerciseController';
import { requireAuth } from '../middlewares/authMiddleware';

const router = Router();

router.use(requireAuth);

router.get('/', getExercises);
router.post('/', createExercise);

export default router;
