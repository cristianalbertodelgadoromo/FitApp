import { pool } from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface Routine {
  id?: number;
  client_id: number;
  coach_id: number;
  nombre: string;
  fecha_inicio: string;
  activa?: boolean;
}

export interface RoutineExercise {
  id?: number;
  routine_id: number;
  exercise_id?: number | null;
  nombre_libre?: string | null;
  series?: number | null;
  repeticiones?: number | null;
  duracion_min?: number | null;
  notas?: string | null;
  orden?: number;
}

export const RoutineModel = {
  async findAllByCoach(coachId: number): Promise<Routine[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT r.*, c.nombre AS client_nombre
       FROM routines r
       LEFT JOIN clients c ON r.client_id = c.id
       WHERE r.coach_id = ?
       ORDER BY r.id DESC`,
      [coachId]
    );
    return rows as Routine[];
  },

  async findAll(): Promise<Routine[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT r.*, c.nombre AS client_nombre
       FROM routines r
       LEFT JOIN clients c ON r.client_id = c.id
       ORDER BY r.id DESC`
    );
    return rows as Routine[];
  },

  async findById(id: number): Promise<Routine | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT r.*, c.nombre AS client_nombre
       FROM routines r
       LEFT JOIN clients c ON r.client_id = c.id
       WHERE r.id = ?`,
      [id]
    );
    return rows.length > 0 ? (rows[0] as Routine) : null;
  },

  async findActiveByClient(clientId: number): Promise<Routine | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT r.*, c.nombre AS client_nombre
       FROM routines r
       LEFT JOIN clients c ON r.client_id = c.id
       WHERE r.client_id = ? AND r.activa = TRUE
       ORDER BY r.fecha_inicio DESC
       LIMIT 1`,
      [clientId]
    );
    return rows.length > 0 ? (rows[0] as Routine) : null;
  },

  async findExercises(routineId: number): Promise<RoutineExercise[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT re.*, e.nombre AS nombre
       FROM routine_exercises re
       LEFT JOIN exercises e ON re.exercise_id = e.id
       WHERE re.routine_id = ?
       ORDER BY re.orden ASC, re.id ASC`,
      [routineId]
    );
    return rows as RoutineExercise[];
  },

  async create(routine: Routine): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO routines (client_id, coach_id, nombre, fecha_inicio, activa)
       VALUES (?, ?, ?, ?, TRUE)`,
      [routine.client_id, routine.coach_id, routine.nombre, routine.fecha_inicio]
    );
    return result.insertId;
  },

  async addExercise(routineId: number, exercise: Omit<RoutineExercise, 'id' | 'routine_id'>): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO routine_exercises (routine_id, exercise_id, nombre_libre, series, repeticiones, duracion_min, notas, orden)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        routineId,
        exercise.exercise_id ?? null,
        exercise.nombre_libre ?? null,
        exercise.series ?? null,
        exercise.repeticiones ?? null,
        exercise.duracion_min ?? null,
        exercise.notas ?? null,
        exercise.orden ?? 0,
      ]
    );
    return result.insertId;
  },

  async update(id: number, data: Partial<Routine>): Promise<boolean> {
    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (fields.length === 0) return false;
    values.push(id);

    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE routines SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  },

  async deleteExercise(routineId: number, exerciseRecordId: number): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      `DELETE FROM routine_exercises WHERE id = ? AND routine_id = ?`,
      [exerciseRecordId, routineId]
    );
    return result.affectedRows > 0;
  },
};
