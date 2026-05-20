import { Request, Response } from 'express';
import { ExerciseModel, Exercise } from '../models/exerciseModel';

export const getExercises = async (req: Request, res: Response): Promise<void> => {
  try {
    const { grupo, nivel } = req.query;
    const exercises = await ExerciseModel.findAll({ 
      grupo: grupo as string, 
      nivel: nivel as string 
    });
    res.status(200).json({ success: true, data: exercises, message: 'Ejercicios listados con éxito' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};

export const createExercise = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre, grupo_muscular, tipo, nivel, descripcion } = req.body;

    if (!nombre) {
      res.status(400).json({ success: false, data: null, message: 'El nombre del ejercicio es obligatorio' });
      return;
    }

    const exercise: Exercise = { nombre, grupo_muscular, tipo, nivel, descripcion };
    const newId = await ExerciseModel.create(exercise);

    res.status(201).json({ success: true, data: { id: newId, ...exercise }, message: 'Ejercicio creado con éxito' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, data: null, message: 'Error interno del servidor' });
  }
};
