import { Router } from 'express';
import {
  getRoutines,
  getRoutineById,
  getClientRoutine,
  getRoutineExercises,
  createRoutine,
  addExerciseToRoutine,
  updateRoutine,
  deleteExerciseFromRoutine,
} from '../controllers/routineController';
import { requireAuth } from '../middlewares/authMiddleware';
import { requireRole } from '../middlewares/roleMiddleware';
import { PERMISSIONS } from '../config/permissions';

const router = Router();

router.use(requireAuth);

// Rutas públicas (coach + sysadmin)
router.get('/', requireRole(...PERMISSIONS.routines.listOwn), getRoutines);

// Rutas de cliente (ver rutina activa propia)
router.get('/client/:clientId', requireRole(...PERMISSIONS.routines.viewMine, ...PERMISSIONS.routines.listOwn), getClientRoutine);

// Detalle de rutina y ejercicios
router.get('/:id', requireRole(...PERMISSIONS.routines.listOwn, ...PERMISSIONS.routines.viewMine), getRoutineById);
router.get('/:id/exercises', requireRole(...PERMISSIONS.routineExercises.read), getRoutineExercises);

// CRUD para coach/admin
router.post('/', requireRole(...PERMISSIONS.routines.create), createRoutine);
router.post('/:id/exercises', requireRole(...PERMISSIONS.routineExercises.write), addExerciseToRoutine);
router.put('/:id', requireRole(...PERMISSIONS.routines.create), updateRoutine);
router.delete('/:id/exercises/:exerciseId', requireRole(...PERMISSIONS.routineExercises.write), deleteExerciseFromRoutine);

export default router;
