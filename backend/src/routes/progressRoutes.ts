import { Router } from 'express';
import {
  getProgressByClient,
  compareProgress,
  createProgressRecord,
  deleteProgressRecord
} from '../controllers/progressController';
import { requireAuth } from '../middlewares/authMiddleware';
import { requireRole } from '../middlewares/roleMiddleware';
import { PERMISSIONS } from '../config/permissions';
import { upload } from '../config/upload';

const router = Router();

router.use(requireAuth);

router.get('/client/:clientId', requireRole(...PERMISSIONS.progress.read), getProgressByClient);
router.get('/compare/:clientId', requireRole(...PERMISSIONS.progress.read), compareProgress);

router.post(
  '/client/:clientId',
  requireRole(...PERMISSIONS.progress.write),
  upload.fields([
    { name: 'foto_frente', maxCount: 1 },
    { name: 'foto_espalda', maxCount: 1 },
    { name: 'foto_lateral', maxCount: 1 }
  ]),
  createProgressRecord
);

router.delete('/:id', requireRole(...PERMISSIONS.progress.delete), deleteProgressRecord);

export default router;
