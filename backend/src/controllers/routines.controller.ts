import { Response } from 'express';
import { RoutineModel } from '../models/routineModel';
import { Request } from 'express';

export const getRoutines = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    let routines;

    if (user.rol === 'admin') {
      routines = await RoutineModel.findAll();
    } else {
      routines = await RoutineModel.findAllByCoach(user.id);
    }

    res.status(200).json({ success: true, data: routines, message: 'Rutinas obtenidas con éxito' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};

export const getRoutineById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const routine = await RoutineModel.findById(id);

    if (!routine) {
      res.status(404).json({ success: false, data: null, message: 'Rutina no encontrada' });
      return;
    }

    res.status(200).json({ success: true, data: routine, message: 'Rutina encontrada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};

export const getClientRoutine = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const clientId = parseInt(req.params.clientId as string, 10);

    if (user.rol === 'client' && user.id !== clientId) {
      res.status(403).json({
        success: false,
        data: null,
        message: 'No tienes permiso para ver la rutina de otro cliente'
      });
      return;
    }

    const routine = await RoutineModel.findActiveByClient(clientId);
    res.status(200).json({
      success: true,
      data: routine,
      message: routine ? 'Rutina activa encontrada' : 'Sin rutina activa asignada'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};

export const getRoutineExercises = async (req: Request, res: Response): Promise<void> => {
  try {
    const routineId = parseInt(req.params.id as string, 10);
    const exercises = await RoutineModel.findExercises(routineId);
    res.status(200).json({ success: true, data: exercises, message: 'Ejercicios de la rutina obtenidos' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};

export const createRoutine = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { nombre, client_id, fecha_inicio, fecha_fin } = req.body;

    if (!nombre || !client_id || !fecha_inicio) {
      res.status(400).json({
        success: false,
        data: null,
        message: 'Faltan campos requeridos: nombre, client_id, fecha_inicio'
      });
      return;
    }

    const newId = await RoutineModel.create({
      nombre,
      client_id: parseInt(client_id, 10),
      coach_id: user.id,
      fecha_inicio,
      fecha_fin: fecha_fin || null,
    });

    const newRoutine = await RoutineModel.findById(newId);
    res.status(201).json({ success: true, data: newRoutine, message: 'Rutina creada con éxito' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};

export const addExerciseToRoutine = async (req: Request, res: Response): Promise<void> => {
  try {
    const routineId = parseInt(req.params.id as string, 10);
    const { exercise_id, series, repeticiones, peso_kg, descanso_seg, orden } = req.body;

    if (!exercise_id) {
      res.status(400).json({
        success: false,
        data: null,
        message: 'Faltan campos requeridos: exercise_id'
      });
      return;
    }

    const newId = await RoutineModel.addExercise(routineId, {
      exercise_id: parseInt(exercise_id, 10),
      series: series ? parseInt(series, 10) : 3,
      repeticiones: repeticiones ? parseInt(repeticiones, 10) : null,
      peso_kg: peso_kg ? parseFloat(peso_kg) : null,
      descanso_seg: descanso_seg ? parseInt(descanso_seg, 10) : 60,
      orden: orden ? parseInt(orden, 10) : 1,
    });

    res.status(201).json({ success: true, data: { id: newId }, message: 'Ejercicio agregado a la rutina con éxito' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};

export const updateRoutineExercise = async (req: Request, res: Response): Promise<void> => {
  try {
    const routineId = parseInt(req.params.routineId as string, 10);
    const id = parseInt(req.params.id as string, 10);
    const updates = req.body;

    const data: any = {};
    if (updates.exercise_id !== undefined) data.exercise_id = parseInt(updates.exercise_id, 10);
    if (updates.series !== undefined) data.series = parseInt(updates.series, 10);
    if (updates.repeticiones !== undefined) data.repeticiones = updates.repeticiones !== null ? parseInt(updates.repeticiones, 10) : null;
    if (updates.peso_kg !== undefined) data.peso_kg = updates.peso_kg !== null ? parseFloat(updates.peso_kg) : null;
    if (updates.descanso_seg !== undefined) data.descanso_seg = parseInt(updates.descanso_seg, 10);
    if (updates.orden !== undefined) data.orden = parseInt(updates.orden, 10);

    const updated = await RoutineModel.updateExercise(routineId, id, data);
    if (!updated) {
      res.status(400).json({ success: false, message: 'No se pudo actualizar el ejercicio en la rutina' });
      return;
    }

    res.status(200).json({ success: true, message: 'Ejercicio de la rutina actualizado con éxito' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};

export const updateRoutine = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string, 10);
    const updates = req.body;

    const existing = await RoutineModel.findById(id);
    if (!existing) {
      res.status(404).json({ success: false, data: null, message: 'Rutina no encontrada' });
      return;
    }

    const data: any = {};
    if (updates.nombre !== undefined) data.nombre = updates.nombre;
    if (updates.fecha_inicio !== undefined) data.fecha_inicio = updates.fecha_inicio;
    if (updates.fecha_fin !== undefined) data.fecha_fin = updates.fecha_fin;
    if (updates.activa !== undefined) data.activa = updates.activa;

    const updated = await RoutineModel.update(id, data);
    if (!updated) {
      res.status(400).json({ success: false, data: null, message: 'No se pudo actualizar la rutina' });
      return;
    }

    const updatedRoutine = await RoutineModel.findById(id);
    res.status(200).json({ success: true, data: updatedRoutine, message: 'Rutina actualizada con éxito' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};

export const deleteRoutine = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string, 10);

    const deleted = await RoutineModel.delete(id);
    if (!deleted) {
      res.status(404).json({ success: false, data: null, message: 'Rutina no encontrada' });
      return;
    }

    res.status(200).json({ success: true, data: null, message: 'Rutina eliminada con éxito' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};

export const deleteExerciseFromRoutine = async (req: Request, res: Response): Promise<void> => {
  try {
    const routineId = parseInt(req.params.routineId as string, 10);
    const exerciseRecordId = parseInt(req.params.id as string, 10);

    const deleted = await RoutineModel.deleteExercise(routineId, exerciseRecordId);
    if (!deleted) {
      res.status(404).json({ success: false, data: null, message: 'Ejercicio no encontrado en la rutina' });
      return;
    }

    res.status(200).json({ success: true, data: null, message: 'Ejercicio eliminado de la rutina con éxito' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};
