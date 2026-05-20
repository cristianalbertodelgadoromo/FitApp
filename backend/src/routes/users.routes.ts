import { Router } from 'express';
import { getUsers, getUserById, updateUser, deleteUser } from '../controllers/users.controller';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.get('/',      requireRole('admin'), getUsers);
router.get('/:id',   getUserById); // internally validated for admin or self
router.put('/:id',   updateUser);   // internally validated for admin or self
router.delete('/:id', requireRole('admin'), deleteUser);

export default router;
