import { pool } from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface Routine {
  id?: number;
  client_id: number;
  coach_id: number;
  nombre: string;
  fecha_inicio: string;
  fecha_fin?: string | null;
  activa?: boolean;
}

export interface RoutineExercise {
  id?: number;
  routine_id: number;
  exercise_id: number;
  series?: number;
  repeticiones?: number | null;
  peso_kg?: number | null;
  descanso_seg?: number;
  orden?: number;
}

export const RoutineModel = {
  async findAllByCoach(coachId: number): Promise<Routine[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT r.*, u.nombre AS client_nombre
       FROM routines r
       LEFT JOIN users u ON r.client_id = u.id
       WHERE r.coach_id = ?
       ORDER BY r.id DESC`,
      [coachId]
    );
    return rows as Routine[];
  },

  async findAll(): Promise<Routine[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT r.*, u.nombre AS client_nombre
       FROM routines r
       LEFT JOIN users u ON r.client_id = u.id
       ORDER BY r.id DESC`
    );
    return rows as Routine[];
  },

  async findById(id: number): Promise<Routine | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT r.*, u.nombre AS client_nombre
       FROM routines r
       LEFT JOIN users u ON r.client_id = u.id
       WHERE r.id = ?`,
      [id]
    );
    return rows.length > 0 ? (rows[0] as Routine) : null;
  },

  async findActiveByClient(clientId: number): Promise<Routine | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT r.*, u.nombre AS client_nombre
       FROM routines r
       LEFT JOIN users u ON r.client_id = u.id
       WHERE r.client_id = ? AND r.activa = TRUE
       ORDER BY r.fecha_inicio DESC
       LIMIT 1`,
      [clientId]
    );
    return rows.length > 0 ? (rows[0] as Routine) : null;
  },

  async findExercises(routineId: number): Promise<(RoutineExercise & { nombre: string })[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT re.*, e.nombre
       FROM routine_exercises re
       JOIN exercises e ON re.exercise_id = e.id
       WHERE re.routine_id = ?
       ORDER BY re.orden ASC, re.id ASC`,
      [routineId]
    );
    return rows as (RoutineExercise & { nombre: string })[];
  },

  async create(routine: Routine): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO routines (client_id, coach_id, nombre, fecha_inicio, fecha_fin, activa)
       VALUES (?, ?, ?, ?, ?, TRUE)`,
      [routine.client_id, routine.coach_id, routine.nombre, routine.fecha_inicio, routine.fecha_fin ?? null]
    );
    return result.insertId;
  },

  async addExercise(routineId: number, exercise: Omit<RoutineExercise, 'id' | 'routine_id'>): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO routine_exercises (routine_id, exercise_id, series, repeticiones, peso_kg, descanso_seg, orden)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        routineId,
        exercise.exercise_id,
        exercise.series ?? 3,
        exercise.repeticiones ?? null,
        exercise.peso_kg ?? null,
        exercise.descanso_seg ?? 60,
        exercise.orden ?? 1,
      ]
    );
    return result.insertId;
  },

  async updateExercise(routineId: number, id: number, exercise: Partial<Omit<RoutineExercise, 'id' | 'routine_id'>>): Promise<boolean> {
    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(exercise).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (fields.length === 0) return false;
    values.push(id, routineId);

    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE routine_exercises SET ${fields.join(', ')} WHERE id = ? AND routine_id = ?`,
      values
    );
    return result.affectedRows > 0;
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

  async delete(id: number): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      `DELETE FROM routines WHERE id = ?`,
      [id]
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
