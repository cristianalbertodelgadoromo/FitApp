import { Router } from 'express';
import { getFoods, createFood } from '../controllers/foodController';
import { requireAuth } from '../middlewares/authMiddleware';
import { requireRole } from '../middlewares/roleMiddleware';
import { PERMISSIONS } from '../config/permissions';

const router = Router();

router.use(requireAuth);

router.get('/', requireRole(...PERMISSIONS.foods.list), getFoods);
router.post('/', requireRole(...PERMISSIONS.foods.create), createFood);

export default router;
