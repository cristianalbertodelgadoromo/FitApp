import { Router } from 'express';
import {
  getProgressByClient,
  compareProgress,
  createProgressRecord,
  deleteProgressRecord,
} from '../controllers/progress.controller';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.get('/:clientId',         requireRole('admin', 'coach', 'client'), getProgressByClient);
router.get('/:clientId/compare', requireRole('admin', 'coach', 'client'), compareProgress);
router.post('/:clientId',        requireRole('admin', 'coach'), createProgressRecord);
router.delete('/:id',            requireRole('admin', 'coach'), deleteProgressRecord);

export default router;
