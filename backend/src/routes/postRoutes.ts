import { Router } from 'express';
import { getPosts, createPost, deletePost } from '../controllers/postController';
import { requireAuth } from '../middlewares/authMiddleware';
import { requireRole } from '../middlewares/roleMiddleware';
import { Rol } from '../types/roles';

const router = Router();

router.use(requireAuth);

router.get('/', getPosts);
router.post('/', requireRole(Rol.Coach, Rol.SysAdmin), createPost);
router.delete('/:id', requireRole(Rol.Coach, Rol.SysAdmin), deletePost);

export default router;
