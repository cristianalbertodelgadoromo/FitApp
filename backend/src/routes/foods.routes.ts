import { Router } from 'express';
import { getFoods, createFood, updateFood, deleteFood } from '../controllers/foods.controller';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.get('/',      requireRole('admin', 'coach', 'client', 'nutritionist'), getFoods);
router.post('/',     requireRole('admin', 'nutritionist'), createFood);
router.put('/:id',   requireRole('admin', 'nutritionist'), updateFood);
router.delete('/:id', requireRole('admin'), deleteFood);

export default router;
