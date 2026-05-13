import { Router } from 'express';
import { getFoods, createFood } from '../controllers/foodController';
import { requireAuth } from '../middlewares/authMiddleware';

const router = Router();

router.use(requireAuth);

router.get('/', getFoods);
router.post('/', createFood);

export default router;
