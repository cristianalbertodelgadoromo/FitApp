import { Router } from 'express';
import { getFoodLogs, createFoodLog, deleteFoodLog } from '../controllers/food_logs.controller';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.get('/:clientId', requireRole('admin', 'coach', 'client'), getFoodLogs);
router.post('/',         requireRole('coach', 'client'), createFoodLog);
router.delete('/:id',    requireRole('admin', 'coach'), deleteFoodLog);

export default router;
