import { Router } from 'express';
import { getClients, getClientById, createClient, updateClient, deleteClient } from '../controllers/clientController';
import { requireAuth } from '../middlewares/authMiddleware';
import { requireRole } from '../middlewares/roleMiddleware';
import { PERMISSIONS } from '../config/permissions';

const router = Router();

router.use(requireAuth);

router.get('/all', requireRole(...PERMISSIONS.clients.listAll), getClients);
router.get('/', requireRole(...PERMISSIONS.clients.listOwn), getClients);
router.get('/:id', requireRole(...PERMISSIONS.clients.viewOwn), getClientById);
router.post('/', requireRole(...PERMISSIONS.clients.create), createClient);
router.put('/:id', requireRole(...PERMISSIONS.clients.update), updateClient);
router.delete('/:id', requireRole(...PERMISSIONS.clients.delete), deleteClient);

export default router;
