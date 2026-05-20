import { pool } from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface Exercise {
  id?: number;
  nombre: string;
  grupo_muscular?: string;
  tipo?: string;
  nivel?: string;
  descripcion?: string;
}

export const ExerciseModel = {
  async findAll(filters: { grupo?: string; nivel?: string }): Promise<Exercise[]> {
    let query = 'SELECT * FROM exercises WHERE 1=1';
    const params: any[] = [];

    if (filters.grupo) {
      query += ' AND grupo_muscular = ?';
      params.push(filters.grupo);
    }
    if (filters.nivel) {
      query += ' AND nivel = ?';
      params.push(filters.nivel);
    }

    const [rows] = await pool.query<RowDataPacket[]>(query, params);
    return rows as Exercise[];
  },

  async findById(id: number): Promise<Exercise | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM exercises WHERE id = ?',
      [id]
    );
    if (rows.length === 0) return null;
    return rows[0] as Exercise;
  },

  async create(exercise: Exercise): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO exercises (nombre, grupo_muscular, tipo, nivel, descripcion) VALUES (?, ?, ?, ?, ?)',
      [
        exercise.nombre,
        exercise.grupo_muscular ?? null,
        exercise.tipo ?? null,
        exercise.nivel ?? null,
        exercise.descripcion ?? null
      ]
    );
    return result.insertId;
  }
};
