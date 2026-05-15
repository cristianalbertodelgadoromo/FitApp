import { Router } from 'express';
import { getFoodLogs, createFoodLog, deleteFoodLog } from '../controllers/foodLogController';
import { requireAuth } from '../middlewares/authMiddleware';
import { requireRole } from '../middlewares/roleMiddleware';
import { PERMISSIONS } from '../config/permissions';

const router = Router();

router.use(requireAuth);

router.get('/:clientId', requireRole(...PERMISSIONS.foodLogs.read), getFoodLogs);
router.post('/', requireRole(...PERMISSIONS.foodLogs.create), createFoodLog);
router.delete('/:id', requireRole(...PERMISSIONS.foodLogs.delete), deleteFoodLog);

export default router;
