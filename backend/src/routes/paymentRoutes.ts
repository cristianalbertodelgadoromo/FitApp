import { Router } from 'express';
import { getPayments, createPayment, deletePayment } from '../controllers/paymentController';
import { requireAuth } from '../middlewares/authMiddleware';
import { requireRole } from '../middlewares/roleMiddleware';
import { Rol } from '../types/roles';

const router = Router();

router.use(requireAuth);

router.get('/', getPayments);
router.post('/', requireRole(Rol.Coach, Rol.SysAdmin), createPayment);
router.delete('/:id', requireRole(Rol.Coach, Rol.SysAdmin), deletePayment);

export default router;
