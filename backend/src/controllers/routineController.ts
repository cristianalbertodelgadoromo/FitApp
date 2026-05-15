import { Response } from 'express';
import { RoutineModel } from '../models/routineModel';
import { AuthRequest } from '../middlewares/authMiddleware';

export const getRoutines = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    let routines;

    if (user.rol === 'sysadmin') {
      routines = await RoutineModel.findAll();
    } else {
      routines = await RoutineModel.findAllByCoach(user.id);
    }

    return res.status(200).json({ success: true, data: routines, message: 'Rutinas obtenidas con éxito' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};

export const getRoutineById = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const routine = await RoutineModel.findById(id);

    if (!routine) {
      return res.status(404).json({ success: false, data: null, message: 'Rutina no encontrada' });
    }

    return res.status(200).json({ success: true, data: routine, message: 'Rutina encontrada' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};

export const getClientRoutine = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const clientId = parseInt(req.params.clientId, 10);

    // Cliente solo puede ver su propia rutina
    if (user.rol === 'cliente' && user.id !== clientId) {
      return res.status(403).json({
        success: false,
        data: null,
        message: 'No tienes permiso para ver la rutina de otro cliente'
      });
    }

    const routine = await RoutineModel.findActiveByClient(clientId);
    return res.status(200).json({
      success: true,
      data: routine,
      message: routine ? 'Rutina activa encontrada' : 'Sin rutina activa asignada'
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};

export const getRoutineExercises = async (req: AuthRequest, res: Response) => {
  try {
    const routineId = parseInt(req.params.id, 10);
    const exercises = await RoutineModel.findExercises(routineId);
    return res.status(200).json({ success: true, data: exercises, message: 'Ejercicios de la rutina obtenidos' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};

export const createRoutine = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const { nombre, client_id, fecha_inicio } = req.body;

    if (!nombre || !client_id || !fecha_inicio) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Faltan campos requeridos: nombre, client_id, fecha_inicio'
      });
    }

    const newId = await RoutineModel.create({
      nombre,
      client_id: parseInt(client_id, 10),
      coach_id: user.id,
      fecha_inicio,
    });

    const newRoutine = await RoutineModel.findById(newId);
    return res.status(201).json({ success: true, data: newRoutine, message: 'Rutina creada con éxito' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};

export const addExerciseToRoutine = async (req: AuthRequest, res: Response) => {
  try {
    const routineId = parseInt(req.params.id, 10);
    const { exercise_id, nombre_libre, series, repeticiones, duracion_min, notas, orden } = req.body;

    if (!exercise_id && !nombre_libre) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Debes proporcionar exercise_id (del catálogo) o nombre_libre (texto libre)'
      });
    }

    const newId = await RoutineModel.addExercise(routineId, {
      exercise_id: exercise_id ? parseInt(exercise_id, 10) : null,
      nombre_libre: nombre_libre || null,
      series: series ? parseInt(series, 10) : null,
      repeticiones: repeticiones ? parseInt(repeticiones, 10) : null,
      duracion_min: duracion_min ? parseInt(duracion_min, 10) : null,
      notas: notas || null,
      orden: orden ? parseInt(orden, 10) : 0,
    });

    return res.status(201).json({ success: true, data: { id: newId }, message: 'Ejercicio agregado a la rutina' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};

export const updateRoutine = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const updates = req.body;

    const existing = await RoutineModel.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, data: null, message: 'Rutina no encontrada' });
    }

    const updated = await RoutineModel.update(id, updates);
    if (!updated) {
      return res.status(400).json({ success: false, data: null, message: 'No se pudo actualizar la rutina' });
    }

    const updatedRoutine = await RoutineModel.findById(id);
    return res.status(200).json({ success: true, data: updatedRoutine, message: 'Rutina actualizada con éxito' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};

export const deleteExerciseFromRoutine = async (req: AuthRequest, res: Response) => {
  try {
    const routineId = parseInt(req.params.id, 10);
    const exerciseRecordId = parseInt(req.params.exerciseId, 10);

    const deleted = await RoutineModel.deleteExercise(routineId, exerciseRecordId);
    if (!deleted) {
      return res.status(404).json({ success: false, data: null, message: 'Ejercicio no encontrado en la rutina' });
    }

    return res.status(200).json({ success: true, data: null, message: 'Ejercicio eliminado de la rutina' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};
