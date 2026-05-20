import { Router } from 'express';
import {
  getRoutines,
  getRoutineById,
  getClientRoutine,
  getRoutineExercises,
  createRoutine,
  addExerciseToRoutine,
  updateRoutineExercise,
  updateRoutine,
  deleteRoutine,
  deleteExerciseFromRoutine,
} from '../controllers/routines.controller';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.get('/',                            requireRole('admin', 'coach', 'client'), getRoutines);
router.get('/client/:clientId',             requireRole('admin', 'coach', 'client'), getClientRoutine);
router.get('/:id',                         requireRole('admin', 'coach', 'client'), getRoutineById);
router.get('/:id/exercises',               requireRole('admin', 'coach', 'client'), getRoutineExercises);

router.post('/',                           requireRole('admin', 'coach'), createRoutine);
router.post('/:id/exercises',               requireRole('admin', 'coach'), addExerciseToRoutine);
router.put('/:routineId/exercises/:id',    requireRole('admin', 'coach'), updateRoutineExercise);
router.put('/:id',                         requireRole('admin', 'coach'), updateRoutine);
router.delete('/:routineId/exercises/:id', requireRole('admin', 'coach'), deleteExerciseFromRoutine);
router.delete('/:id',                      requireRole('admin', 'coach'), deleteRoutine);

export default router;
