import { Router } from 'express';
import { getClients, getClientById, createClient, updateClient, deleteClient } from '../controllers/clients.controller';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.get('/',      requireRole('admin', 'coach'), getClients);
router.post('/',     requireRole('admin', 'coach'), createClient);
router.get('/:id',   requireRole('admin', 'coach', 'client'), getClientById);
router.put('/:id',   requireRole('admin', 'coach'), updateClient);
router.delete('/:id', requireRole('admin'), deleteClient);

export default router;
